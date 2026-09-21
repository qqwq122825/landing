<?php
declare(strict_types=1);
ini_set('display_errors','0');
date_default_timezone_set('Asia/Shanghai');
const HUB_ROOT=__DIR__.'/..';
class HubError extends RuntimeException { public $status; public function __construct(string $msg,int $status=400){parent::__construct($msg);$this->status=$status;} }
function runtime_dir():string { return getenv('HUB_DATA_DIR') ?: HUB_ROOT.'/runtime'; }
function db():PDO {
 static $db=null;if($db) return $db;
 $dir=runtime_dir();if(!is_dir($dir))mkdir($dir,0700,true);
 $db=new PDO('sqlite:'.$dir.'/hub.sqlite',null,null,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);
 $db->exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
 $db->exec('CREATE TABLE IF NOT EXISTS admins(id INTEGER PRIMARY KEY, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1);
 CREATE TABLE IF NOT EXISTS projects(id INTEGER PRIMARY KEY, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1, status TEXT NOT NULL DEFAULT "active", template TEXT NOT NULL DEFAULT "feiyue", app_name TEXT NOT NULL, download_url TEXT NOT NULL DEFAULT "", pixel_id TEXT NOT NULL DEFAULT "", verify_code TEXT NOT NULL DEFAULT "", logo_data TEXT NOT NULL DEFAULT "", note TEXT NOT NULL DEFAULT "", created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS deleted_projects(id INTEGER PRIMARY KEY, slug TEXT NOT NULL UNIQUE, deleted_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS visits(project_id INTEGER NOT NULL REFERENCES projects(id), id TEXT NOT NULL, started_at INTEGER NOT NULL, ip_address TEXT NOT NULL, country TEXT NOT NULL, region TEXT NOT NULL, city TEXT NOT NULL, device TEXT NOT NULL, os TEXT NOT NULL, browser TEXT NOT NULL, duration_ms INTEGER NOT NULL DEFAULT 0, clicked INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(project_id,id));
 CREATE INDEX IF NOT EXISTS visits_project_time ON visits(project_id,started_at DESC);
 CREATE TABLE IF NOT EXISTS events(project_id INTEGER NOT NULL REFERENCES projects(id), id TEXT NOT NULL, visit_id TEXT NOT NULL, type TEXT NOT NULL, created_at INTEGER NOT NULL, PRIMARY KEY(project_id,id));
 CREATE TABLE IF NOT EXISTS limits(bucket TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY, actor TEXT NOT NULL, action TEXT NOT NULL, project_id INTEGER, detail TEXT NOT NULL DEFAULT "", created_at INTEGER NOT NULL);');
 // Additive migration: existing accounts keep their hashes and both existing templates.
 $columns=array_column($db->query('PRAGMA table_info(projects)')->fetchAll(),'name');
 if(!in_array('password_cipher',$columns,true)||!in_array('allowed_templates',$columns,true)){
  $db->exec('BEGIN IMMEDIATE');
  try{
   $columns=array_column($db->query('PRAGMA table_info(projects)')->fetchAll(),'name');
   if(!in_array('password_cipher',$columns,true))$db->exec("ALTER TABLE projects ADD COLUMN password_cipher TEXT NOT NULL DEFAULT ''");
   if(!in_array('allowed_templates',$columns,true))$db->exec("ALTER TABLE projects ADD COLUMN allowed_templates TEXT NOT NULL DEFAULT '[\"feiyue\",\"dptv\"]'");
   $db->exec('COMMIT');
  }catch(Throwable $e){$db->exec('ROLLBACK');throw $e;}
 }
 @chmod($dir.'/hub.sqlite',0600);return $db;
}
function query(string $sql,array $args=[]):PDOStatement{$q=db()->prepare($sql);$q->execute($args);return $q;}
function now_ms():int{return (int)floor(microtime(true)*1000);}
function secret():string {
 $dir=runtime_dir();if(!is_dir($dir))mkdir($dir,0700,true);
 $file=$dir.'/secret.key';$h=fopen($file,'c+');if(!$h)throw new RuntimeException('Signing key storage unavailable');
 try{if(!flock($h,LOCK_EX))throw new RuntimeException('Signing key lock failed');chmod($file,0600);$key=trim(stream_get_contents($h));
  if($key===''){$key=bin2hex(random_bytes(32));rewind($h);fwrite($h,$key);fflush($h);}
  if(!preg_match('/^[a-f0-9]{64}$/D',$key))throw new RuntimeException('Signing key invalid');
  return $key;
 }finally{flock($h,LOCK_UN);fclose($h);}
}
require_once __DIR__.'/credentials.php';
$config=['hash_key'=>'hub-visitor','cloudflare_proxy_mode'=>'auto'];require __DIR__.'/geo.php';
function origin():string {
 if($configured=getenv('HUB_ORIGIN'))return rtrim($configured,'/');
 $host=strtolower($_SERVER['HTTP_HOST'] ?? 'localhost');
 if(!preg_match('/^[a-z0-9.-]+(?::[1-9][0-9]{0,4})?$/D',$host))throw new HubError('站点域名格式错误',400);
 $local=getenv('HUB_DEV')==='1' && preg_match('/^(localhost|127\.0\.0\.1)(:\d+)?$/D',$host);
 return ($local?'http://':'https://').$host;
}
function json_response(array $data,int $status=200):void {http_response_code($status);header('Content-Type: application/json; charset=utf-8');header('Cache-Control: no-store');echo json_encode($data,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR);}
function body(int $limit=300000):array {
 if((int)($_SERVER['CONTENT_LENGTH']??0)>$limit)throw new HubError('请求内容过大',413);
 $raw=file_get_contents('php://input',false,null,0,$limit+1);if(strlen($raw)>$limit)throw new HubError('请求内容过大',413);
 try{$data=json_decode($raw,true,10,JSON_THROW_ON_ERROR);}catch(Throwable $e){throw new HubError('请求格式错误');}
 if(!is_array($data))throw new HubError('请求格式错误');return $data;
}
function same_origin():void {if(($_SERVER['HTTP_ORIGIN']??'')!==origin()||($_SERVER['HTTP_SEC_FETCH_SITE']??'')==='cross-site')throw new HubError('请从本站页面操作',403);}
function limit(string $key,int $max,int $seconds):void {
 $key=hash('sha256',$key);$now=time();
 query('DELETE FROM limits WHERE expires < ?',[$now]);
 query('INSERT INTO limits(bucket,count,expires) VALUES(?,1,?) ON CONFLICT(bucket) DO UPDATE SET count=count+1',[$key,$now+$seconds]);
 if((int)query('SELECT count FROM limits WHERE bucket=?',[$key])->fetchColumn()>$max){header('Retry-After: '.$seconds);throw new HubError('操作较频繁，请稍后重试',429);}
}
function project(string $slug,bool $active=false):array {
 $p=query('SELECT * FROM projects WHERE slug=?',[$slug])->fetch();if(!$p)throw new HubError('项目不存在',404);
 if($active&&$p['status']!=='active')throw new HubError('该项目已暂停，请联系管理员',403);return $p;
}
function start_session(string $realm):void {
 if(session_status()===PHP_SESSION_ACTIVE&&session_name()==='hub_'.$realm)return;
 if(session_status()===PHP_SESSION_ACTIVE)session_write_close();
 $_SESSION=[];
 $dir=runtime_dir().'/sessions';if(!is_dir($dir))mkdir($dir,0700,true);
 session_save_path($dir);session_name('hub_'.$realm);ini_set('session.use_strict_mode','1');ini_set('session.gc_maxlifetime','28800');
 $cookie=$_COOKIE['hub_'.$realm]??'';session_id(is_string($cookie)&&preg_match('/^[a-zA-Z0-9,-]{16,128}$/D',$cookie)?$cookie:'');
 session_set_cookie_params(['lifetime'=>0,'path'=>$realm==='super'?'/':'/p/'.$realm,'httponly'=>true,'secure'=>strpos(origin(),'https:')===0,'samesite'=>'Strict']);session_start();
 if(!isset($_SESSION['csrf']))$_SESSION['csrf']=bin2hex(random_bytes(24));
}
function auth(string $realm):array {
 start_session($realm);$uid=$_SESSION['uid']??0;
 $p=$realm==='super'?query('SELECT * FROM admins WHERE id=?',[$uid])->fetch():query('SELECT * FROM projects WHERE id=? AND slug=?',[$uid,$realm])->fetch();
 if(!$p||($_SESSION['until']??0)<time()||($_SESSION['version']??0)!==(int)$p['version']||($realm!=='super'&&$p['status']!=='active'))throw new HubError('请登录后继续',401);
 return $p;
}
function csrf():void {same_origin();if(!hash_equals($_SESSION['csrf']??'',$_SERVER['HTTP_X_CSRF_TOKEN']??'')||empty($_SESSION['csrf']))throw new HubError('页面凭据已过期，请刷新重试',403);}
function login(string $realm,array $data):array {
 start_session($realm);same_origin();$username=is_string($data['username']??null)?trim($data['username']):'';$password=is_string($data['password']??null)?$data['password']:'';
 limit('login:'.$realm.':'.hub_ip(),15,900);limit('account:'.$realm.':'.strtolower($username),20,900);
 $p=$realm==='super'?query('SELECT * FROM admins WHERE username=?',[$username])->fetch():query('SELECT * FROM projects WHERE slug=? AND username=?',[$realm,$username])->fetch();
 $dummy='$2y$10$P70OdqwLeBkFctwpnjcwheFKnp64EYDRGSq2A2MW2p/IToL/QQcl6';
 $valid=strlen($password)<=256 && password_verify($password,$p['password_hash']??$dummy);
 if(!$p||!$valid||($realm!=='super'&&$p['status']!=='active'))throw new HubError('账号或密码不正确，或项目已暂停',401);
 session_regenerate_id(true);$_SESSION=['uid'=>(int)$p['id'],'version'=>(int)$p['version'],'until'=>time()+28800,'csrf'=>bin2hex(random_bytes(24))];
 audit($realm==='super'?'总站:'.$p['username']:$p['username'],'登录',$realm==='super'?null:(int)$p['id']);return ['ok'=>true,'csrf'=>$_SESSION['csrf'],'username'=>$p['username']];
}
function audit(string $actor,string $action,?int $id=null,string $detail=''):void {query('INSERT INTO audit(actor,action,project_id,detail,created_at) VALUES(?,?,?,?,?)',[$actor,$action,$id,$detail,now_ms()]);}
function clean_text($value,int $max,string $label,bool $required=true):string {
 if(!is_string($value))throw new HubError($label.'格式错误');$value=trim($value);
 if(($required&&$value==='')||mb_strlen($value)>$max||preg_match('/[<>\x00-\x1f\x7f]/u',$value))throw new HubError('请填写有效'.$label);return $value;
}
function url_value($value):string {
 $value=clean_text($value,2048,'下载地址',false);if($value==='')return '';$parts=parse_url($value);
 if(!filter_var($value,FILTER_VALIDATE_URL)||!in_array(strtolower($parts['scheme']??''),['https','http'],true)||isset($parts['user'])||isset($parts['pass'])||preg_match('/\s/',$value))throw new HubError('下载地址需为完整 HTTP / HTTPS 链接');return $value;
}
const HUB_TEMPLATES=['feiyue','dptv','quest'];
const HUB_DEFAULT_TEMPLATES=['feiyue','dptv'];
const HUB_TEMPLATE_NAMES=['feiyue'=>'ReelShort','dptv'=>'DPTV','quest'=>'Pasion TV'];
function effective_app_name(array $p,?string $template=null):string {$name=trim($p['app_name']??'');return $name!==''?$name:HUB_TEMPLATE_NAMES[$template??$p['template']];}
function public_settings(array $p,?string $template=null):array {$template=$template??$p['template'];return ['slug'=>$p['slug'],'appName'=>effective_app_name($p,$template),'appNameOverride'=>$p['app_name'],'template'=>$template,'downloadUrl'=>'/p/'.$p['slug'].'/dl','pixelId'=>$p['pixel_id'],'verifyCode'=>$p['verify_code'],'logoData'=>$p['logo_data']];}
function validate_templates($value):array {
 if(!is_array($value)||!array_is_list($value)||!$value||count($value)>count(HUB_TEMPLATES))throw new HubError('请至少开放一款模板');
 foreach($value as $id)if(!is_string($id)||!in_array($id,HUB_TEMPLATES,true))throw new HubError('请选择已有模板');
 return array_values(array_intersect(HUB_TEMPLATES,array_unique($value)));
}
function project_templates(array $p):array {
 $value=json_decode($p['allowed_templates']??'[]',true);
 // Invalid stored permissions fail closed instead of granting every template.
 if(!is_array($value)||!array_is_list($value))return [];foreach($value as $id)if(!is_string($id))return [];
 return array_values(array_intersect(HUB_TEMPLATES,$value));
}
function admin_project(array $p,bool $super=true):array {
 $p['allowedTemplates']=project_templates($p);
 $p['effectiveAppName']=effective_app_name($p);$p['defaultAppName']=HUB_TEMPLATE_NAMES[$p['template']];
 if($super)$p['credentialsAvailable']=($p['password_cipher']??'')!=='';
 unset($p['password_hash'],$p['password_cipher'],$p['allowed_templates'],$p['version']);if(!$super)unset($p['note']);$p['id']=(int)$p['id'];return $p;
}
function create_project(array $b,string $actor):array {
 $name=clean_text($b['name']??'',80,'项目名称');$app=clean_text($b['appName']??'',80,'应用名',false);$url=url_value($b['downloadUrl']??'');$note=clean_text($b['note']??'',500,'备注',false);
 $allowed=validate_templates($b['allowedTemplates']??HUB_DEFAULT_TEMPLATES);$template=$b['template']??$allowed[0];
 if(!in_array($template,$allowed,true))throw new HubError('初始模板需在开放模板中');
 do{$slug=substr(bin2hex(random_bytes(6)),0,9);}while(query('SELECT 1 FROM projects WHERE slug=? UNION ALL SELECT 1 FROM deleted_projects WHERE slug=?',[$slug,$slug])->fetchColumn());
 $username=random_customer_credential(false);$password=random_customer_credential(true);$time=now_ms();
 $cipher=seal_customer_password($password,$slug,$username);
 // Allocate inside the same INSERT, including retired IDs: old visit tokens must never match a new project.
 query('INSERT INTO projects(id,slug,name,username,password_hash,password_cipher,allowed_templates,template,app_name,download_url,note,created_at,updated_at) VALUES((SELECT MAX(COALESCE((SELECT MAX(id) FROM projects),0),COALESCE((SELECT MAX(id) FROM deleted_projects),0))+1),?,?,?,?,?,?,?,?,?,?,?,?)',[$slug,$name,$username,password_hash($password,PASSWORD_DEFAULT),$cipher,json_encode($allowed),$template,$app,$url,$note,$time,$time]);
 $p=project($slug);audit($actor,'创建项目',(int)$p['id'],$name);return ['project'=>admin_project($p),'credentials'=>delivery_credentials($p,$password)];
}
function delete_project(string $slug,array $b,string $actor):array {
 if(!is_string($b['confirmSlug']??null)||!hash_equals($slug,$b['confirmSlug']))throw new HubError('请输入完整项目编号确认删除');
 $pdo=db();$pdo->exec('BEGIN IMMEDIATE');
 try{
  $p=project($slug);$id=(int)$p['id'];
  // Only non-personal route/ID retirement metadata survives; never reuse deleted identities.
  query('INSERT INTO deleted_projects(id,slug,deleted_at) VALUES(?,?,?)',[$id,$slug,now_ms()]);
  query('DELETE FROM events WHERE project_id=?',[$id]);
  query('DELETE FROM visits WHERE project_id=?',[$id]);
  query('DELETE FROM projects WHERE id=?',[$id]);
  audit($actor,'删除项目',$id,'项目：'.$p['name'].'；路径：/p/'.$slug.'；客户账号、配置与访问记录已删除');
  $pdo->exec('COMMIT');
  return ['ok'=>true,'deleted'=>$slug];
 }catch(Throwable $e){$pdo->exec('ROLLBACK');throw $e;}
}
function save_project(array $p,array $b,string $actor,bool $super):array {
 db()->beginTransaction();
 try{
 // Re-read permissions inside the same transaction that saves the template.
 $p=project($p['slug']);$fields=[];$args=[];
 $allowed=project_templates($p);
 if(array_key_exists('allowedTemplates',$b)){
  if(!$super)throw new HubError('模板开放权限由总站管理',403);
  $allowed=validate_templates($b['allowedTemplates']);$fields[]='allowed_templates=?';$args[]=json_encode($allowed);
  if(!isset($b['template'])&&!in_array($p['template'],$allowed,true))$b['template']=$allowed[0];
 }

 foreach(['appName'=>['app_name',80,'应用名',false],'note'=>['note',500,'备注',false],'name'=>['name',80,'项目名称',true]] as $key=>$spec){if(!array_key_exists($key,$b)||(!$super&&in_array($key,['name','note'],true)))continue;$fields[]=$spec[0].'=?';$args[]=clean_text($b[$key],$spec[1],$spec[2],$spec[3]);}
 if(array_key_exists('downloadUrl',$b)){$fields[]='download_url=?';$args[]=url_value($b['downloadUrl']);}
 if(isset($b['template'])){if(!in_array($b['template'],HUB_TEMPLATES,true))throw new HubError('模板不存在');if(!in_array($b['template'],$allowed,true))throw new HubError('该模板尚未对当前账号开放',403);$fields[]='template=?';$args[]=$b['template'];}
 foreach(['pixelId'=>['pixel_id','/^[0-9]{5,30}$/D']] as $key=>$spec){if(!array_key_exists($key,$b))continue;$v=$b[$key];if(!is_string($v)||($v!==''&&!preg_match($spec[1],$v)))throw new HubError('Pixel ID 格式错误');$fields[]=$spec[0].'=?';$args[]=$v;}
 if(array_key_exists('logoData',$b)){$v=$b['logoData'];if(!is_string($v))throw new HubError('图标格式错误');if($v!==''){if(!preg_match('#^data:image/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$#D',$v,$m))throw new HubError('请选择 PNG / JPG / WebP 图片');$raw=base64_decode($m[2],true);$info=$raw===false?false:@getimagesizefromstring($raw);if(!$info||strlen($raw)>204800||$info[0]>4096||$info[1]>4096||$info['mime']!=='image/'.$m[1])throw new HubError('图片需在 200 KB 和 4096 像素以内');}$fields[]='logo_data=?';$args[]=$v;}
 if(!$fields)throw new HubError('没有待保存的配置');$fields[]='updated_at=?';$args[]=now_ms();$args[]=$p['id'];query('UPDATE projects SET '.implode(',',$fields).' WHERE id=?',$args);audit($actor,array_key_exists('allowedTemplates',$b)?'更新模板开放权限':'更新项目配置',(int)$p['id']);$result=admin_project(project($p['slug']),$super);db()->commit();return $result;
 }catch(Throwable $e){if(db()->inTransaction())db()->rollBack();throw $e;}
}
