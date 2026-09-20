<?php
$path=rawurldecode(parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH) ?: '/');
$root=realpath(__DIR__.'/public');$file=realpath($root.$path);
if ($path!=='/' && $file && strpos($file,$root.DIRECTORY_SEPARATOR)===0 && is_file($file) && pathinfo($file,PATHINFO_EXTENSION)!=='php') return false;
require __DIR__.'/public/index.php';
