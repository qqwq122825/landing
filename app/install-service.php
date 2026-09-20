<?php
declare(strict_types=1);
require_once __DIR__.'/bootstrap.php';

function hub_install_lock_path():string { return runtime_dir().'/install.lock'; }
function hub_install_is_locked():bool { return file_exists(hub_install_lock_path()); }

function hub_install_checks():array {
    $dir=runtime_dir();
    if(!is_dir($dir))@mkdir($dir,0700,true);
    $drivers=class_exists('PDO')?PDO::getAvailableDrivers():[];
    return [
        ['label'=>'PHP 8.1 或更新版本','ok'=>PHP_VERSION_ID>=80100,'detail'=>'当前 '.PHP_VERSION],
        ['label'=>'PDO SQLite 数据库扩展','ok'=>in_array('sqlite',$drivers,true),'detail'=>'用于保存管理员、项目配置与统计'],
        ['label'=>'OpenSSL 加密扩展','ok'=>credentials_crypto_ready(),'detail'=>'用于加密保存客户交付密码（AES-256-GCM）'],
        ['label'=>'mbstring 字符串扩展','ok'=>extension_loaded('mbstring'),'detail'=>'用于中文与输入校验'],
        ['label'=>'数据目录可写','ok'=>is_dir($dir)&&is_writable($dir),'detail'=>'runtime 或 HUB_DATA_DIR 指定目录'],
        ['label'=>'程序文件完整','ok'=>is_file(HUB_ROOT.'/app/console.html')&&is_file(HUB_ROOT.'/public/assets/console.js')&&is_file(HUB_ROOT.'/public/assets/vendor/tabler-1.5.1/tabler.min.css')&&is_file(HUB_ROOT.'/public/assets/vendor/tabler-1.5.1/tabler.min.js'),'detail'=>'app、public 与本地 Tabler 组件库完整，无需前端编译'],
    ];
}
function hub_install_environment_ready(array $checks):bool {
    foreach($checks as $check)if(!$check['ok'])return false;
    return true;
}
function hub_install_admin_count():int {
    if(!is_file(runtime_dir().'/hub.sqlite'))return 0;
    $pdo=new PDO('sqlite:'.runtime_dir().'/hub.sqlite',null,null,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
    $exists=$pdo->query("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='admins'")->fetchColumn();
    return $exists?(int)$pdo->query('SELECT COUNT(*) FROM admins')->fetchColumn():0;
}
function hub_install_validate_credentials(string $username,string $password):void {
    clean_text($username,80,'管理员账号');
    if(strlen($password)>72||strpos($password,"\0")!==false)throw new HubError('密码请使用 12 至 72 字节，初始默认密码除外');
    if(strlen($password)<12&&!($username==='mtx'&&$password==='mtx123'))throw new HubError('自定义密码请至少填写 12 位；默认账号为 mtx / mtx123');
}

/** Install only while unlocked. No customer data is deleted, even on reinstallation. */
function hub_install_run(string $username,string $password,bool $confirmExisting=false,string $actor='网页安装'):array {
    if(hub_install_is_locked())throw new HubError('安装已锁定，请先在服务器手动删除 install.lock 文件',423);
    if(!hub_install_environment_ready(hub_install_checks()))throw new HubError('请先修复环境检查中未通过的项目',503);
    $username=trim($username);hub_install_validate_credentials($username,$password);
    // A stable mutex serializes different browsers and CLI invocations.
    $mutex=fopen(runtime_dir().'/.install.mutex','c+');
    if(!$mutex)throw new HubError('安装互斥文件创建失败，请检查数据目录权限',503);
    @chmod(runtime_dir().'/.install.mutex',0600);
    $lock=null;$created=false;$committed=false;$pdo=null;$backup=null;
    try {
        if(!flock($mutex,LOCK_EX))throw new HubError('安装文件正忙，请稍后重试',503);
        if(hub_install_is_locked())throw new HubError('安装已锁定，请先在服务器手动删除 install.lock 文件',423);
        $hadDatabase=is_file(runtime_dir().'/hub.sqlite');$pdo=db();
        $admin=query('SELECT * FROM admins ORDER BY id LIMIT 1')->fetch();
        if($admin&&!$confirmExisting)throw new HubError('检测到已有管理员，请勾选保留数据并更新管理员的确认项',409);
        if($admin&&query('SELECT COUNT(*) FROM admins WHERE username=? AND id<>?',[$username,$admin['id']])->fetchColumn())throw new HubError('此账号已被另一位管理员使用，请更换账号',409);
        $lock=@fopen(hub_install_lock_path(),'x');
        if(!$lock)throw new HubError('安装锁创建失败或已存在，请检查数据目录权限',423);
        $created=true;@chmod(hub_install_lock_path(),0600);
        if($hadDatabase){
            $dir=runtime_dir().'/backups';if(!is_dir($dir)&&!mkdir($dir,0700,true))throw new RuntimeException('Backup directory creation failed');
            $backup='before-install-'.date('Ymd-His').'-'.bin2hex(random_bytes(4)).'.sqlite';
            $pdo->exec('VACUUM INTO '.$pdo->quote($dir.'/'.$backup));chmod($dir.'/'.$backup,0600);
        }
        // Prepare the durable lock BEFORE changing credentials. A crash after commit stays locked.
        $meta=json_encode(['installedAt'=>gmdate('c'),'version'=>1,'reinstalled'=>(bool)$admin],JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR)."\n";
        if(fwrite($lock,$meta)!==strlen($meta)||!fflush($lock))throw new RuntimeException('Installation lock write failed');
        secret();$pdo->beginTransaction();
        if($admin)query('UPDATE admins SET username=?,password_hash=?,version=version+1 WHERE id=?',[$username,password_hash($password,PASSWORD_DEFAULT),$admin['id']]);
        else query('INSERT INTO admins(username,password_hash) VALUES(?,?)',[$username,password_hash($password,PASSWORD_DEFAULT)]);
        audit($actor,$admin?'重装并更新总站管理员':'初始化总站',null,'客户项目与统计保留');
        $pdo->commit();$committed=true;
        return ['username'=>$username,'reinstalled'=>(bool)$admin,'backup'=>$backup];
    } finally {
        if($pdo&&$pdo->inTransaction())$pdo->rollBack();
        if(is_resource($lock))fclose($lock);
        if($created&&!$committed)@unlink(hub_install_lock_path());
        flock($mutex,LOCK_UN);fclose($mutex);
    }
}
