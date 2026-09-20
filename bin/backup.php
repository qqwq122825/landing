<?php
declare(strict_types=1);
if(PHP_SAPI!=='cli')exit;
require __DIR__.'/../app/bootstrap.php';
$options=getopt('',['output:']);$dir=$options['output']??runtime_dir().'/backups';
if(!is_dir($dir))mkdir($dir,0700,true);$dir=realpath($dir);
if(!$dir||strpos($dir,realpath(HUB_ROOT.'/public').DIRECTORY_SEPARATOR)===0||$dir===realpath(HUB_ROOT.'/public')){fwrite(STDERR,"请将备份保存到公开目录之外。\n");exit(1);}
$path=$dir.'/hub-'.date('Ymd-His').'-'.bin2hex(random_bytes(3)).'.sqlite';
// VACUUM INTO gives a consistent database snapshot, including committed WAL data.
db()->exec('VACUUM INTO '.db()->quote($path));chmod($path,0600);
echo "数据库备份：".$path."\n另行妥善备份 数据目录的 secret.key、credentials.key 和服务器环境配置（密钥与数据库分开妥善保存）。\n";
