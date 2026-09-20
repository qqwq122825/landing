<?php
declare(strict_types=1);
header('X-Content-Type-Options: nosniff');
require __DIR__.'/../app/bootstrap.php';require __DIR__.'/../app/routes.php';
$path=rawurldecode(parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH)?:'/');$method=$_SERVER['REQUEST_METHOD']??'GET';$isApi=strpos($path,'/api/')!==false;
if($path==='/install.php'||$path==='/install'){require __DIR__.'/../app/installer.php';exit;}
try{
 if(preg_match('#^/api(/.*)$#D',$path,$m)){json_response(handle_api('super',$m[1]));}
 elseif(preg_match('#^/p/([a-z0-9]{7,12})/api(/.*)$#D',$path,$m)){
  $p=project($m[1],true);
  if($m[2]==='/event'&&$method==='POST'){record_event($p,body(4096));json_response(['ok'=>true]);}
  else json_response(handle_api($m[1],$m[2]));
 }
 elseif(($path==='/'||$path==='/admin')&&$method==='GET'){render_console('super');}
 elseif(preg_match('#^/templates/([a-z0-9_-]+)/preview$#D',$path,$m)&&$method==='GET'){render_catalog_preview($m[1]);}
 elseif(preg_match('#^/p/([a-z0-9]{7,12})/admin/?$#D',$path,$m)&&$method==='GET'){render_console($m[1]);}
 elseif(preg_match('#^/p/([a-z0-9]{7,12})/preview/(feiyue|dptv)$#D',$path,$m)&&$method==='GET'){
  $p=project($m[1]);$isSuper=false;try{auth('super');$isSuper=true;}catch(HubError $e){if(session_status()===PHP_SESSION_ACTIVE)session_write_close();}
  if(!$isSuper){$account=auth($m[1]);if(!in_array($m[2],project_templates($account),true))throw new HubError('该模板尚未对当前账号开放',403);}render_landing($p,true,$m[2]);
 }
 elseif(preg_match('#^/p/([a-z0-9]{7,12})/dl$#D',$path,$m)&&$method==='GET'){$p=project($m[1],true);if($p['download_url']==='')throw new HubError('下载地址尚未配置，请联系项目管理员',404);header('Cache-Control: no-store');header('Location: '.$p['download_url'],true,302);}
 elseif(preg_match('#^/p/([a-z0-9]{7,12})/?$#D',$path,$m)&&$method==='GET'){render_landing(project($m[1],true));}
 else throw new HubError('页面不存在',404);
}catch(Throwable $e){$status=$e instanceof HubError?$e->status:500;$message=$e instanceof HubError?$e->getMessage():'服务暂时繁忙，请稍后重试';if(!($e instanceof HubError))error_log('Landing Hub: '.$e->getMessage());if($isApi)json_response(['error'=>$message],$status);else{http_response_code($status);header('Content-Type: text/html; charset=utf-8');header('Cache-Control: no-store');echo '<!doctype html><html lang="zh"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Landing Hub</title><link rel="stylesheet" href="/assets/console.css"><body class="error-page"><div class="empty-card"><span class="logo-mark">L</span><h1>'.htmlspecialchars($message,ENT_QUOTES,'UTF-8').'</h1><p>Landing Hub · 项目服务</p><a href="/">返回总站</a></div></body></html>';}}
