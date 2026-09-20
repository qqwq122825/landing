<?php
declare(strict_types=1);
if(PHP_SAPI!=='cli')exit;
require __DIR__.'/../app/bootstrap.php';
$options=getopt('',['username:']);$username=$options['username']??'mtx';
$a=query('SELECT * FROM admins WHERE username=?',[$username])->fetch();
if(!$a){fwrite(STDERR,"管理员不存在。\n");exit(1);}
$password=rtrim(strtr(base64_encode(random_bytes(18)),'+/','-_'),'=');
query('UPDATE admins SET password_hash=?,version=version+1 WHERE id=?',[password_hash($password,PASSWORD_DEFAULT),$a['id']]);
audit('服务器 CLI','重置总站管理员密码',null,$username);
fwrite(STDOUT,"账号：".$username."\n新密码：".$password."\n原密码和原有会话已失效，请立即保存新密码。\n");
