<?php
declare(strict_types=1);
require __DIR__.'/analytics.php';
function template_catalog():array {
 return [
  ['id'=>'feiyue','name'=>'Feiyue / ReelShort','brand'=>'ReelShort','description'=>'深色短剧风格，包含剧集推荐与悬浮下载入口。','tags'=>['短剧推荐','深色风格','自适应'],'appName'=>'ReelShort'],
  ['id'=>'dptv','name'=>'DPTV / MinuteDrama','brand'=>'DPTV','description'=>'影音展示风格，包含内容海报与应用下载区域。','tags'=>['影音展示','海报布局','自适应'],'appName'=>'DPTV'],
 ];
}
function template_inventory():array {
 // Read only the public account identifiers needed by the master inventory.
 $projects=query('SELECT slug,name,username,status,template,allowed_templates FROM projects ORDER BY created_at DESC,id DESC')->fetchAll();
 $catalog=template_catalog();
 foreach($catalog as &$item){
  $item['previewUrl']='/templates/'.$item['id'].'/preview';$item['usedCount']=0;$item['allowedCount']=0;$item['projects']=[];
  foreach($projects as $p){
   $using=$p['template']===$item['id'];$allowed=in_array($item['id'],project_templates($p),true);
   if($using)$item['usedCount']++;if($allowed)$item['allowedCount']++;
   if($using||$allowed){unset($p['allowed_templates']);$p['using']=$using;$p['allowed']=$allowed;$item['projects'][]=$p;}
  }
 }
 unset($item);return ['templates'=>$catalog,'projectCount'=>count($projects)];
}
function render_catalog_preview(string $id):void {
 auth('super');
 $templates=array_column(template_catalog(),null,'id');
 if(!isset($templates[$id]))throw new HubError('模板不存在',404);
 // No project is created and no real account settings enter the preview.
 $p=['id'=>0,'slug'=>'template-demo','template'=>$id,'app_name'=>$templates[$id]['appName'],'pixel_id'=>'','verify_code'=>'','logo_data'=>''];
 header('X-Frame-Options: SAMEORIGIN');header('X-Robots-Tag: noindex, nofollow');
 render_landing($p,true,$id);
}
function handle_api(string $realm,string $route):array {
 $method=$_SERVER['REQUEST_METHOD'];
 if($realm==='super'&&in_array($route,['/session','/login'],true)&&(int)query('SELECT COUNT(*) FROM admins')->fetchColumn()===0)throw new HubError('总站尚未安装，请访问 /install.php 完成安装',503);
 if($method==='POST'&&$route==='/login')return login($realm,body(4096));
 $account=auth($realm);$super=$realm==='super';$actor=($super?'总站:':'').$account['username'];
 if($method==='GET'){
  if($super&&$route==='/templates')return template_inventory();
  if($route==='/session')return ['username'=>$account['username'],'role'=>$super?'super':'customer','csrf'=>$_SESSION['csrf'],'project'=>$super?null:admin_project($account,false)];
  if($super&&$route==='/projects'){
   $projects=query('SELECT p.id,p.slug,p.name,p.username,p.status,p.template,p.app_name,p.note,p.download_url,p.allowed_templates,(LENGTH(p.password_cipher)>0) credentialsAvailable,p.created_at,p.updated_at,(SELECT COUNT(*) FROM visits v WHERE v.project_id=p.id) visits,(SELECT COALESCE(SUM(clicked),0) FROM visits v WHERE v.project_id=p.id) conversions FROM projects p ORDER BY p.created_at DESC')->fetchAll();
   foreach($projects as &$item){$item['allowedTemplates']=project_templates($item);$item['credentialsAvailable']=(bool)$item['credentialsAvailable'];unset($item['allowed_templates']);}unset($item);
   return ['projects'=>$projects,'totals'=>totals(),'active'=>(int)query("SELECT COUNT(*) FROM projects WHERE status='active'")->fetchColumn()];
  }
  if($super&&$route==='/audit')return ['rows'=>query('SELECT a.id,a.actor,a.action,a.detail,a.created_at,p.name project FROM audit a LEFT JOIN projects p ON p.id=a.project_id ORDER BY a.id DESC LIMIT 100')->fetchAll()];
  if($super&&preg_match('#^/projects/([a-z0-9]{7,12})$#D',$route,$m)){$p=project($m[1]);return ['project'=>admin_project($p),'stats'=>stats((int)$p['id'])];}
  if(!$super&&$route==='/dashboard')return ['project'=>admin_project($account,false),'stats'=>stats((int)$account['id'])];
 }elseif($method==='POST'){
  csrf();$b=body();
  if($route==='/logout'){$_SESSION=[];session_destroy();setcookie(session_name(),'', ['expires'=>time()-3600,'path'=>$super?'/':'/p/'.$realm,'httponly'=>true,'secure'=>strpos(origin(),'https:')===0,'samesite'=>'Strict']);return ['ok'=>true];}
  if($super&&$route==='/projects'){limit('create:'.$account['id'],30,3600);return create_project($b,$actor);}
  if($super&&preg_match('#^/projects/([a-z0-9]{7,12})(/status|/password|/credentials)?$#D',$route,$m)){
   $p=project($m[1]);$action=$m[2]??'';
   if($action==='/status'){$status=$b['status']??'';if(!in_array($status,['active','paused'],true))throw new HubError('项目状态格式错误');query('UPDATE projects SET status=?,version=version+1,updated_at=? WHERE id=?',[$status,now_ms(),$p['id']]);audit($actor,$status==='active'?'恢复项目':'暂停项目',(int)$p['id']);return ['project'=>admin_project(project($m[1]))];}
   if($action==='/credentials'){limit('credentials:'.$account['id'],60,600);$password=open_customer_password($p);audit($actor,'查看客户交付信息',(int)$p['id']);return ['available'=>$password!==null,'credentials'=>delivery_credentials($p,$password)];}
   if($action==='/password'){$password=random_customer_credential(true);$cipher=seal_customer_password($password,$p['slug'],$p['username']);query('UPDATE projects SET password_hash=?,password_cipher=?,version=version+1,updated_at=? WHERE id=?',[password_hash($password,PASSWORD_DEFAULT),$cipher,now_ms(),$p['id']]);audit($actor,'重置客户密码',(int)$p['id']);return ['credentials'=>delivery_credentials($p,$password)];}
   return ['project'=>save_project($p,$b,$actor,true)];
  }
  if(!$super&&$route==='/settings')return ['project'=>save_project($account,$b,$actor,false)];
 }
 throw new HubError('接口不存在或请求方法不匹配',404);
}
function render_landing(array $p,bool $preview=false,?string $template=null):void {
 $template=$template??$p['template'];if(!in_array($template,['feiyue','dptv'],true))throw new HubError('模板不存在',404);
 $html=file_get_contents(HUB_ROOT.'/resources/pages/'.$template.'.html');
 $html=str_replace('https://alphapundits.com/p/p6y2sej/dl','/p/'.$p['slug'].'/dl',$html);
 $html=preg_replace('#<script\b[^>]*src=["\'][^"\']*(?:config|site-settings|brand-settings|analytics)\.js[^"\']*["\'][^>]*>\s*</script>#i','',$html);
 $html=preg_replace('#<base\b[^>]*>#i','',$html);
 $data=public_settings($p);$visit=bin2hex(random_bytes(16));$issued=time();$data['preview']=$preview;$data['visitId']=$visit;$data['issued']=$issued;$data['token']=$preview?'':page_token((int)$p['id'],$visit,$issued);
 $encoded=json_encode($data,JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT|JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
 $head='<base href="/themes/'.$template.'/"><script>window.HUB_PAGE='.$encoded.';window.APP_CONFIG=Object.freeze({appName:HUB_PAGE.appName,apkUrl:HUB_PAGE.downloadUrl});window.TV_PREVIEW=HUB_PAGE.preview;window.TV_SETTINGS_READY=Promise.resolve(HUB_PAGE);</script>';
 $html=preg_replace_callback('#<title>.*?</title>#s',function()use($p){return '<title>'.htmlspecialchars($p['app_name'],ENT_QUOTES,'UTF-8').'</title>';},$html,1);
 $html=preg_replace_callback('#(<head[^>]*>)#i',function($m)use($head){return $m[1].$head;},$html,1);
 $brandVersion=substr(hash_file('sha256',HUB_ROOT.'/public/assets/brand-settings.js'),0,12);
 $html=str_replace('</head>','<script src="/assets/brand-settings.js?v='.$brandVersion.'" defer></script><script src="/assets/collector.js" defer></script></head>',$html);
 header('Content-Type: text/html; charset=utf-8');header('Cache-Control: no-store');header('Referrer-Policy: strict-origin-when-cross-origin');echo $html;
}
function render_console(string $realm):void {
 $role=$realm==='super'?'super':'customer';$title=$role==='super'?'LANDING · 总管理后台':project($realm,true)['app_name'].' · 项目后台';
 header('Content-Type: text/html; charset=utf-8');header('Cache-Control: no-store');header('X-Frame-Options: DENY');header("Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
 // Tenant pages use the original compact dark admin; the master stays separate.
 $view=$role==='super'?'console':'tenant';
 $html=file_get_contents(__DIR__.'/'.$view.'.html');$css=substr(hash_file('sha256',HUB_ROOT.'/public/assets/'.$view.'.css'),0,12);$js=substr(hash_file('sha256',HUB_ROOT.'/public/assets/'.$view.'.js'),0,12);
 $verification=getenv('HUB_FACEBOOK_VERIFY')?:'';
 if($realm==='super'&&preg_match('/^[a-zA-Z0-9_-]{1,128}$/D',$verification))$html=str_replace('</head>','<meta name="facebook-domain-verification" content="'.$verification.'"></head>',$html);
 echo strtr($html,['{{TITLE}}'=>htmlspecialchars($title,ENT_QUOTES,'UTF-8'),'{{REALM}}'=>$realm,'{{ROLE}}'=>$role,'{{CSS}}'=>$css,'{{JS}}'=>$js]);
}
