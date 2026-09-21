<?php
declare(strict_types=1);
require __DIR__.'/analytics.php';
function template_catalog():array {
 return [
  ['id'=>'feiyue','name'=>'Feiyue / ReelShort','brand'=>'ReelShort','description'=>'深色短剧风格，包含剧集推荐与悬浮下载入口。','tags'=>['短剧推荐','深色风格','自适应'],'appName'=>HUB_TEMPLATE_NAMES['feiyue']],
  ['id'=>'dptv','name'=>'DPTV / MinuteDrama','brand'=>'DPTV','description'=>'影音展示风格，包含内容海报与应用下载区域。','tags'=>['影音展示','海报布局','自适应'],'appName'=>HUB_TEMPLATE_NAMES['dptv']],
  ['id'=>'quest','name'=>'Quest / Pasion TV','brand'=>'Pasion TV','description'=>'黑橙色视频目录，竖版卡片、搜索与下载弹窗；内置中英西葡四语界面。','tags'=>['黑橙风格','视频卡片','四语界面'],'appName'=>HUB_TEMPLATE_NAMES['quest']],
  ['id'=>'aivideo','name'=>'AI Video / 阿语短视频','brand'=>'AI Video','description'=>'黑黄竖屏视频风格，原生阿语 RTL，扩展中英西葡界面，含下载浮层。','tags'=>['竖屏视频','阿语 RTL','五语界面'],'appName'=>HUB_TEMPLATE_NAMES['aivideo']],
  ['id'=>'ggtv','name'=>'GGTV','brand'=>'GGTV','description'=>'参考后台 68 号模板的平台适配版；语言与交互差异详见接入记录。','tags'=>['参考 68','图片热链'],'appName'=>HUB_TEMPLATE_NAMES['ggtv']],
  ['id'=>'appstore','name'=>'Google Play / 应用详情','brand'=>'Cast','description'=>'参考后台 69 号模板的平台适配版；语言与交互差异详见接入记录。','tags'=>['参考 69','图片热链'],'appName'=>HUB_TEMPLATE_NAMES['appstore']],
  ['id'=>'ultraplay','name'=>'Ultra Play','brand'=>'Ultra Play','description'=>'参考后台 74 号模板的平台适配版；语言与交互差异详见接入记录。','tags'=>['参考 74','图片热链'],'appName'=>HUB_TEMPLATE_NAMES['ultraplay']],
  ['id'=>'yacinetv','name'=>'Yacine TV','brand'=>'Yacine TV','description'=>'参考后台 77 号模板的平台适配版；语言与交互差异详见接入记录。','tags'=>['参考 77','图片热链'],'appName'=>HUB_TEMPLATE_NAMES['yacinetv']],
  ['id'=>'dptvplus','name'=>'DPTV / 电视介绍','brand'=>'DPTV','description'=>'参考后台 83 号模板的平台适配版；语言与交互差异详见接入记录。','tags'=>['参考 83','图片热链'],'appName'=>HUB_TEMPLATE_NAMES['dptvplus']],
  ['id'=>'fizzio','name'=>'Fizzio Live','brand'=>'Fizzio','description'=>'参考后台 85 号模板的平台适配版；语言与交互差异详见接入记录。','tags'=>['参考 85','图片热链'],'appName'=>HUB_TEMPLATE_NAMES['fizzio']],
  ['id'=>'kyss','name'=>'KYSS','brand'=>'KYSS','description'=>'参考后台 88 号模板的平台适配版；语言与交互差异详见接入记录。','tags'=>['参考 88','图片热链'],'appName'=>HUB_TEMPLATE_NAMES['kyss']],
  ['id'=>'sparkle','name'=>'Sparkle','brand'=>'Sparkle','description'=>'参考后台 90 号模板的平台适配版；语言与交互差异详见接入记录。','tags'=>['参考 90','图片热链'],'appName'=>HUB_TEMPLATE_NAMES['sparkle']],
  ['id'=>'newf','name'=>'NEW-F','brand'=>'NEW-F','description'=>'参考后台 92 号模板的平台适配版；语言与交互差异详见接入记录。','tags'=>['参考 92','图片热链'],'appName'=>HUB_TEMPLATE_NAMES['newf']],
  ['id'=>'soccerqueens','name'=>'Soccer Queens','brand'=>'Soccer Queens','description'=>'参考后台 93 号模板的平台适配版；语言与交互差异详见接入记录。','tags'=>['参考 93','图片热链'],'appName'=>HUB_TEMPLATE_NAMES['soccerqueens']],
  ['id'=>'cinema','name'=>'Netflix Gratis / 影视目录','brand'=>'Netflix Gratis','description'=>'参考后台 96 号模板的平台适配版；语言与交互差异详见接入记录。','tags'=>['参考 96','图片热链'],'appName'=>HUB_TEMPLATE_NAMES['cinema']],
  ['id'=>'noxxtv','name'=>'NOXX TV','brand'=>'NOXX','description'=>'参考后台 100 号模板的平台适配版；语言与交互差异详见接入记录。','tags'=>['参考 100','图片热链'],'appName'=>HUB_TEMPLATE_NAMES['noxxtv']],
  ['id'=>'smarttrade','name'=>'SmartTrade','brand'=>'SmartTrade','description'=>'参考后台 101 号模板的平台适配版；语言与交互差异详见接入记录。','tags'=>['参考 101','图片热链'],'appName'=>HUB_TEMPLATE_NAMES['smarttrade']],
  ['id'=>'stockvault','name'=>'StockVault','brand'=>'StockVault','description'=>'参考后台 102 号模板的平台适配版；语言与交互差异详见接入记录。','tags'=>['参考 102','图片热链'],'appName'=>HUB_TEMPLATE_NAMES['stockvault']],
  ['id'=>'kuaibo','name'=>'KuaiBo','brand'=>'KuaiBo','description'=>'参考后台 70 号模板的平台适配版；语言与交互差异详见接入记录。','tags'=>['参考 70','图片热链'],'appName'=>HUB_TEMPLATE_NAMES['kuaibo']],
  ['id'=>'tikapk','name'=>'Tik APK','brand'=>'Tik APK','description'=>'参考后台 73 号模板的平台适配版；语言与交互差异详见接入记录。','tags'=>['参考 73','图片热链'],'appName'=>HUB_TEMPLATE_NAMES['tikapk']],
  ['id'=>'jiaoyou','name'=>'交友','brand'=>'交友','description'=>'参考后台 76 号模板的平台适配版；语言与交互差异详见接入记录。','tags'=>['参考 76','图片热链'],'appName'=>HUB_TEMPLATE_NAMES['jiaoyou']],
  ['id'=>'cyberheart','name'=>'Cyber Heart Show','brand'=>'Cyber Heart Show','description'=>'参考后台 82 号模板的平台适配版；语言与交互差异详见接入记录。','tags'=>['参考 82','图片热链'],'appName'=>HUB_TEMPLATE_NAMES['cyberheart']],
  ['id'=>'promotions','name'=>'Promotions','brand'=>'VELOCITY GAMING','description'=>'参考后台 86 号模板的平台适配版；语言与交互差异详见接入记录。','tags'=>['参考 86','图片热链'],'appName'=>HUB_TEMPLATE_NAMES['promotions']],
  ['id'=>'india','name'=>'印度','brand'=>'印度','description'=>'参考后台 89 号模板的平台适配版；语言与交互差异详见接入记录。','tags'=>['参考 89','图片热链'],'appName'=>HUB_TEMPLATE_NAMES['india']],
  ['id'=>'apuestamx','name'=>'ApuestaMX','brand'=>'ApuestaMX','description'=>'参考后台 95 号模板的平台适配版；语言与交互差异详见接入记录。','tags'=>['参考 95','图片热链'],'appName'=>HUB_TEMPLATE_NAMES['apuestamx']],
  ['id'=>'loveapp','name'=>'LoveApp','brand'=>'LoveApp','description'=>'参考后台 71 号模板的平台适配版；语言与交互差异详见接入记录。','tags'=>['参考 71','图片热链'],'appName'=>HUB_TEMPLATE_NAMES['loveapp']],
  ['id'=>'qiyou','name'=>'qiyou','brand'=>'qiyou','description'=>'参考后台 75 号模板的平台适配版；语言与交互差异详见接入记录。','tags'=>['参考 75','图片热链'],'appName'=>HUB_TEMPLATE_NAMES['qiyou']],
  ['id'=>'stripchat','name'=>'STRIPCHAT','brand'=>'STRIPCHAT','description'=>'参考后台 78 号模板的平台适配版；语言与交互差异详见接入记录。','tags'=>['参考 78','图片热链'],'appName'=>HUB_TEMPLATE_NAMES['stripchat']],
  ['id'=>'pornparadise','name'=>'Porm Paradise','brand'=>'Porm Paradise','description'=>'参考后台 79 号模板的平台适配版；语言与交互差异详见接入记录。','tags'=>['参考 79','图片热链'],'appName'=>HUB_TEMPLATE_NAMES['pornparadise']],
  ['id'=>'pornhub','name'=>'Pornhub','brand'=>'Pornhub','description'=>'参考后台 80 号模板的平台适配版；语言与交互差异详见接入记录。','tags'=>['参考 80','图片热链'],'appName'=>HUB_TEMPLATE_NAMES['pornhub']],
  ['id'=>'chatee','name'=>'Chatee Live Now','brand'=>'Chatee','description'=>'参考后台 81 号模板的平台适配版；语言与交互差异详见接入记录。','tags'=>['参考 81','图片热链'],'appName'=>HUB_TEMPLATE_NAMES['chatee']],
  ['id'=>'cosplay','name'=>'Cosplay','brand'=>'Cosplay','description'=>'参考后台 84 号模板的平台适配版；语言与交互差异详见接入记录。','tags'=>['参考 84','图片热链'],'appName'=>HUB_TEMPLATE_NAMES['cosplay']],
  ['id'=>'lustylive','name'=>'Lusty Live','brand'=>'Lusty Live','description'=>'参考后台 87 号模板的平台适配版；语言与交互差异详见接入记录。','tags'=>['参考 87','图片热链'],'appName'=>HUB_TEMPLATE_NAMES['lustylive']],
  ['id'=>'nightplay','name'=>'NightPlay','brand'=>'NightPlay','description'=>'参考后台 91 号模板的平台适配版；语言与交互差异详见接入记录。','tags'=>['参考 91','图片热链'],'appName'=>HUB_TEMPLATE_NAMES['nightplay']],
  ['id'=>'bokep','name'=>'Website Bokep','brand'=>'Website Bokep','description'=>'参考后台 94 号模板的平台适配版；语言与交互差异详见接入记录。','tags'=>['参考 94','图片热链'],'appName'=>HUB_TEMPLATE_NAMES['bokep']],
  ['id'=>'xhamster','name'=>'XHAMSTER','brand'=>'XHAMSTER','description'=>'参考后台 97 号模板的平台适配版；语言与交互差异详见接入记录。','tags'=>['参考 97','图片热链'],'appName'=>HUB_TEMPLATE_NAMES['xhamster']],
  ['id'=>'mylive','name'=>'MyLive','brand'=>'MyLive','description'=>'参考后台 99 号模板的平台适配版；语言与交互差异详见接入记录。','tags'=>['参考 99','图片热链'],'appName'=>HUB_TEMPLATE_NAMES['mylive']],
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
 $p=['id'=>0,'slug'=>'template-demo','template'=>$id,'app_name'=>'','pixel_id'=>'','verify_code'=>'','logo_data'=>''];
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
  if($super&&$route==='/audit')return ['rows'=>query("SELECT a.id,a.actor,a.action,a.detail,a.created_at,COALESCE(p.name,CASE WHEN d.id IS NOT NULL THEN '已删除 /p/'||d.slug END) project FROM audit a LEFT JOIN projects p ON p.id=a.project_id LEFT JOIN deleted_projects d ON d.id=a.project_id ORDER BY a.id DESC LIMIT 100")->fetchAll()];
  if($super&&preg_match('#^/projects/([a-z0-9]{7,12})$#D',$route,$m)){$p=project($m[1]);return ['project'=>admin_project($p),'stats'=>stats((int)$p['id'])];}
  if(!$super&&$route==='/dashboard')return ['project'=>admin_project($account,false),'stats'=>stats((int)$account['id'])];
 }elseif($method==='POST'){
  csrf();$b=body();
  if($route==='/logout'){$_SESSION=[];session_destroy();setcookie(session_name(),'', ['expires'=>time()-3600,'path'=>$super?'/':'/p/'.$realm,'httponly'=>true,'secure'=>strpos(origin(),'https:')===0,'samesite'=>'Strict']);return ['ok'=>true];}
  if($super&&$route==='/projects'){limit('create:'.$account['id'],30,3600);return create_project($b,$actor);}
  if($super&&preg_match('#^/projects/([a-z0-9]{7,12})/delete$#D',$route,$m))return delete_project($m[1],$b,$actor);
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
 $template=$template??$p['template'];if(!in_array($template,HUB_TEMPLATES,true))throw new HubError('模板不存在',404);
 $html=file_get_contents(HUB_ROOT.'/resources/pages/'.$template.'.html');
 $html=str_replace('https://alphapundits.com/p/p6y2sej/dl','/p/'.$p['slug'].'/dl',$html);
 $html=preg_replace('#<script\b[^>]*src=["\'][^"\']*(?:config|site-settings|brand-settings|analytics)\.js[^"\']*["\'][^>]*>\s*</script>#i','',$html);
 $html=preg_replace('#<base\b[^>]*>#i','',$html);
 $data=public_settings($p,$template);$visit=bin2hex(random_bytes(16));$issued=time();$data['preview']=$preview;$data['visitId']=$visit;$data['issued']=$issued;$data['token']=$preview?'':page_token((int)$p['id'],$visit,$issued);
 $encoded=json_encode($data,JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT|JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
 $head='<base href="/themes/'.$template.'/"><script>window.HUB_PAGE='.$encoded.';window.APP_CONFIG=Object.freeze({appName:HUB_PAGE.appName,apkUrl:HUB_PAGE.downloadUrl});window.TV_PREVIEW=HUB_PAGE.preview;window.TV_SETTINGS_READY=Promise.resolve(HUB_PAGE);</script>';
 $html=preg_replace_callback('#<title>.*?</title>#s',function()use($data){return '<title>'.htmlspecialchars($data['appName'],ENT_QUOTES,'UTF-8').'</title>';},$html,1);
 $html=preg_replace_callback('#(<head[^>]*>)#i',function($m)use($head){return $m[1].$head;},$html,1);
 $brandVersion=substr(hash_file('sha256',HUB_ROOT.'/public/assets/brand-settings.js'),0,12);
 $collectorVersion=substr(hash_file('sha256',HUB_ROOT.'/public/assets/collector.js'),0,12);
 $html=str_replace('</head>','<script src="/assets/brand-settings.js?v='.$brandVersion.'" defer></script><script src="/assets/collector.js?v='.$collectorVersion.'" defer></script></head>',$html);
 header('Content-Type: text/html; charset=utf-8');header('Cache-Control: no-store');header('Referrer-Policy: strict-origin-when-cross-origin');echo $html;
}
function render_console(string $realm):void {
 $role=$realm==='super'?'super':'customer';$title=$role==='super'?'LANDING · 总管理后台':effective_app_name(project($realm,true)).' · 项目后台';
 header('Content-Type: text/html; charset=utf-8');header('Cache-Control: no-store');header('X-Frame-Options: DENY');header("Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
 // Tenant pages use the original compact dark admin; the master stays separate.
 $view=$role==='super'?'console':'tenant';
 $html=file_get_contents(__DIR__.'/'.$view.'.html');$css=substr(hash_file('sha256',HUB_ROOT.'/public/assets/'.$view.'.css'),0,12);$js=substr(hash_file('sha256',HUB_ROOT.'/public/assets/'.$view.'.js'),0,12);
 $verification=getenv('HUB_FACEBOOK_VERIFY')?:'';
 if($realm==='super'&&preg_match('/^[a-zA-Z0-9_-]{1,128}$/D',$verification))$html=str_replace('</head>','<meta name="facebook-domain-verification" content="'.$verification.'"></head>',$html);
 echo strtr($html,['{{TITLE}}'=>htmlspecialchars($title,ENT_QUOTES,'UTF-8'),'{{REALM}}'=>$realm,'{{ROLE}}'=>$role,'{{CSS}}'=>$css,'{{JS}}'=>$js]);
}
