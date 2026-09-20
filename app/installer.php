<?php
declare(strict_types=1);
require_once __DIR__.'/install-service.php';
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store, max-age=0');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
// Same-origin form POSTs need a usable Origin header for the CSRF origin check.
header('Referrer-Policy: same-origin');
header("Content-Security-Policy: default-src 'none'; style-src 'self'; img-src 'self' data:; form-action 'self'; frame-ancestors 'none'; base-uri 'none'");
$locked=hub_install_is_locked();$checks=[];$error='';$csrf='';$ready=false;$existing=0;$success=null;
$method=$_SERVER['REQUEST_METHOD']??'GET';
try {
    if($locked)http_response_code(423);
    elseif(!in_array($method,['GET','POST'],true)){header('Allow: GET, POST');throw new HubError('请选择页面表单完成安装',405);}
    else {
        $checks=hub_install_checks();$ready=hub_install_environment_ready($checks);
        if(!$ready)http_response_code(503);
        else {
            $existing=hub_install_admin_count();
            $sessions=runtime_dir().'/sessions';if(!is_dir($sessions))mkdir($sessions,0700,true);
            ini_set('session.use_strict_mode','1');ini_set('session.use_only_cookies','1');session_save_path($sessions);session_name('hub_setup');
            session_set_cookie_params(['lifetime'=>0,'path'=>'/','secure'=>strpos(origin(),'https:')===0,'httponly'=>true,'samesite'=>'Strict']);
            if(!session_start())throw new HubError('安装会话创建失败，请检查 sessions 目录权限',503);
            if(empty($_SESSION['setup_csrf'])||($_SESSION['setup_until']??0)<time()){
                $_SESSION['setup_csrf']=bin2hex(random_bytes(24));$_SESSION['setup_until']=time()+1800;
            }
            $csrf=$_SESSION['setup_csrf'];
            if($method==='POST'){
                same_origin();
                if((int)($_SERVER['CONTENT_LENGTH']??0)>8192)throw new HubError('安装表单内容过大',413);
                if(!is_string($_POST['csrf']??null)||!hash_equals($csrf,$_POST['csrf']))throw new HubError('安装页面已过期，请刷新后重新提交',403);
                $username=$_POST['username']??null;$password=$_POST['password']??null;$confirmation=$_POST['password_confirmation']??null;
                if(!is_string($username)||!is_string($password)||!is_string($confirmation))throw new HubError('请填写管理员账号和密码');
                if($password!==$confirmation)throw new HubError('两次填写的密码不一致');
                if(($_POST['confirm_install']??'')!=='1')throw new HubError('请先勾选安装确认项');
                $success=hub_install_run($username,$password,($_POST['confirm_existing']??'')==='1');
                unset($_SESSION['setup_csrf'],$_SESSION['setup_until']);
                session_regenerate_id(true);
            }
        }
    }
}catch(Throwable $e){
    http_response_code($e instanceof HubError?$e->status:503);
    $error=$e instanceof HubError?$e->getMessage():'读取或写入数据库失败，请检查 PHP 扩展、runtime 目录权限及站点错误日志';
    if(!($e instanceof HubError))error_log('Landing Hub installer: '.$e->getMessage());
    if(hub_install_is_locked()&&!$success)$locked=true;
}
$h=static function($s):string{return htmlspecialchars((string)$s,ENT_QUOTES,'UTF-8');};
$css=substr(hash_file('sha256',HUB_ROOT.'/public/assets/install.css'),0,12);
?><!doctype html>
<html lang="zh-Hans"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>LANDING HUB · 安装向导</title><link rel="stylesheet" href="/assets/install.css?v=<?=$h($css)?>"></head>
<body><main class="setup"><header class="brand"><span class="mark">L</span><span>LANDING <b>HUB</b><small>总站安装向导</small></span><span class="version">PHP · SQLite</span></header>
<?php if($success): ?>
<section class="card result"><span class="result-icon">✓</span><div class="eyebrow">READY TO GO</div><h1>总站已安装完成</h1><p>管理员账号：<strong><?=$h($success['username'])?></strong><br>请使用你刚才确认的密码登录。</p><div class="notice">install.lock 已生成，安装入口现已锁定。<?php if($success['reinstalled']): ?><br>已有客户和统计数据已保留，旧总站会话已失效。<?php endif; ?></div><?php if($success['backup']): ?><p class="muted">重装前快照已保存在数据目录的 backups 文件夹中。</p><?php endif; ?><a class="primary" href="/">进入总站登录 →</a></section>
<?php elseif($locked): ?>
<section class="card result"><span class="result-icon locked">◈</span><div class="eyebrow">INSTALLATION LOCKED</div><h1>安装入口已锁定</h1><p>检测到 <code>install.lock</code>，本次访问未修改账号或数据库。</p><div class="notice">需要再次安装时，请到宝塔文件管理，手动删除总站数据目录内的 <strong>install.lock</strong>，然后刷新此页。<br>默认位置：总站目录 / runtime / install.lock。<br>若设置了 HUB_DATA_DIR，请到对应数据目录删除。</div><p class="muted">保留 hub.sqlite、secret.key、credentials.key 和 backups。安装页没有在线删锁功能。</p><a class="primary" href="/">返回总站登录 →</a></section>
<?php else: ?>
<div class="intro"><div class="eyebrow">A SIMPLE START</div><h1>几步，开启你的总站。</h1><p>检查环境，创建管理员，然后开始管理所有客户项目。</p></div>
<section class="card"><div class="section-head"><span class="step">01</span><div><h2>检查运行环境</h2><p>使用 SQLite，无需填写 MySQL 数据库信息。</p></div></div><ul class="checks"><?php foreach($checks as $check): ?><li><div><strong><?=$h($check['label'])?></strong><small><?=$h($check['detail'])?></small></div><span class="check-status <?=$check['ok']?'ok':'bad'?>"><?=$check['ok']?'✓ 已就绪':'待处理'?></span></li><?php endforeach; ?></ul></section>
<section class="card"><div class="section-head"><span class="step">02</span><div><h2><?=$existing?'保留数据，更新管理员':'设置总站管理员'?></h2><p>默认账号 mtx，默认密码 mtx123；正式上线建议更换为长随机密码。</p></div></div>
<?php if($error): ?><p class="error" role="alert"><?=$h($error)?></p><?php endif; ?>
<?php if($ready): ?><form method="post" action="/install.php" autocomplete="off"><input type="hidden" name="csrf" value="<?=$h($csrf)?>"><label>管理员账号<input name="username" value="mtx" maxlength="80" required autocomplete="username"></label><div class="form-grid"><label>管理员密码<input name="password" type="password" value="mtx123" maxlength="72" required autocomplete="new-password"></label><label>确认密码<input name="password_confirmation" type="password" value="mtx123" maxlength="72" required autocomplete="new-password"></label></div>
<?php if($existing): ?><div class="notice warn"><strong>检测到已有总站管理员。</strong><br>本次操作会先备份 SQLite，再更新主管理员账号与密码；保留客户、项目、下载设置及访问统计。</div><label class="checkbox"><input type="checkbox" name="confirm_existing" value="1" required><span>我确认更新现有总站管理员，并保留客户和统计数据。</span></label><?php endif; ?>
<label class="checkbox"><input type="checkbox" name="confirm_install" value="1" required><span>我确认安装；成功后自动生成 install.lock，再次安装需在服务器手动删除该文件。</span></label><button class="primary" type="submit"><?=$existing?'保留数据并重新安装':'安装总站'?> →</button></form>
<?php else: ?><p class="notice warn">请先修复环境检查中未通过的项目，再刷新此页。PHP 需启用 pdo_sqlite、mbstring 与 openssl，并允许 PHP 进程读写数据目录。</p><a class="secondary" href="/install.php">重新检查</a><?php endif; ?>
</section><p class="bottom-note">新项目 APK 地址默认留空 · 登录使用密码哈希 · 客户交付密码加密保存 · 安装成功立即锁定<br>公网部署请在上传后及时完成安装；删除锁文件会重新开放安装入口。</p>
<?php endif; ?>
<footer>LANDING HUB · 让管理集中，让数据独立。</footer></main></body></html>
