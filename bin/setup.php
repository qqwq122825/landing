<?php
declare(strict_types=1);
if(PHP_SAPI!=='cli')exit;
require __DIR__.'/../app/install-service.php';
$options=getopt('',['username:','password:','random-password','demo']);$username=$options['username']??'mtx';
$password=$options['password']??($username==='mtx'&&!isset($options['random-password'])?'mtx123':rtrim(strtr(base64_encode(random_bytes(18)),'+/','-_'),'='));
if(hub_install_admin_count()){fwrite(STDERR,"总站已初始化，保留现有账号。\n");exit(1);}
$username=clean_text($username,80,'管理员账号');
if(strlen($password)<12&&!($username==='mtx'&&$password==='mtx123')){fwrite(STDERR,"自定义密码请使用至少 12 位。\n");exit(1);}
try{hub_install_run($username,$password,false,'CLI 初始化');}catch(Throwable $e){fwrite(STDERR,$e->getMessage()."\n");exit(1);}
$_SERVER['HTTP_HOST']='127.0.0.1:57600';putenv('HUB_DEV=1');
$lines=["总后台入口：".origin()."/","总管理员账号：".$username,"总管理员密码：".$password,"初始凭据保存在私有 runtime；默认密码仅供初始使用，正式上线前请更换。",''];
if(isset($options['demo'])){foreach([['DPTV 全球站','DPTV','dptv','演示项目 · 影视应用'],['Feiyue 短剧','Feiyue','feiyue','演示项目 · 短剧投放'],['Mango 影音','Mango TV','feiyue','演示项目 · 备用渠道']] as $v){$r=create_project(['name'=>$v[0],'appName'=>$v[1],'template'=>$v[2],'note'=>$v[3]],'初始化');$lines[]=$v[0].'：'.json_encode($r['credentials'],JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);}}
$file=runtime_dir().'/初始账号.txt';file_put_contents($file,implode("\n",$lines)."\n");chmod($file,0600);echo implode("\n",array_slice($lines,0,4))."\n已保存：".$file."\n";
