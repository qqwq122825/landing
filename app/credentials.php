<?php
declare(strict_types=1);

/** Separate private key for recoverable customer delivery credentials, not login verification. */
function credential_key(bool $create=false):string {
    $path=runtime_dir().'/credentials.key';
    if(!is_file($path)&&(!$create||(int)query("SELECT COUNT(*) FROM projects WHERE password_cipher<>''")->fetchColumn()>0))throw new HubError('交付密钥缺失，请从备份恢复数据目录的 credentials.key',503);
    $mask=umask(0077);
    try{$h=@fopen($path,$create?'c+b':'rb');}finally{umask($mask);}
    if(!$h)throw new HubError('交付密钥读取失败，请检查数据目录权限',503);
    try{
        if(!flock($h,$create?LOCK_EX:LOCK_SH))throw new HubError('交付密钥正忙，请稍后重试',503);
        $hex=trim(stream_get_contents($h));
        if($hex===''&&$create){
            // Never silently replace a missing key after encrypted credentials have been stored.
            if((int)query("SELECT COUNT(*) FROM projects WHERE password_cipher<>''")->fetchColumn()>0)throw new HubError('交付密钥缺失，请从备份恢复数据目录的 credentials.key',503);
            $hex=bin2hex(random_bytes(32));rewind($h);
            if(fwrite($h,$hex."\n")!==65||!fflush($h))throw new HubError('交付密钥保存失败，请检查数据目录权限',503);
        }
        if(!preg_match('/^[a-f0-9]{64}$/D',$hex))throw new HubError('交付密钥格式异常，请恢复原有 credentials.key',503);
        @chmod($path,0600);return hex2bin($hex);
    }finally{flock($h,LOCK_UN);fclose($h);}
}
function credentials_crypto_ready():bool {
    return function_exists('openssl_encrypt')&&function_exists('openssl_decrypt')&&in_array('aes-256-gcm',openssl_get_cipher_methods(),true);
}
function seal_customer_password(string $password,string $slug,string $username):string {
    if(!credentials_crypto_ready())throw new HubError('请启用 PHP OpenSSL 扩展及 AES-256-GCM 支持',503);
    $key=credential_key(true);$iv=random_bytes(12);$tag='';
    $cipher=openssl_encrypt($password,'aes-256-gcm',$key,OPENSSL_RAW_DATA,$iv,$tag,'hub-project-credential:v1:'.$slug.':'.$username,16);
    if($cipher===false||strlen($tag)!==16)throw new HubError('交付密码加密失败，请稍后重试',503);
    return 'v1:'.base64_encode($iv.$tag.$cipher);
}
function open_customer_password(array $p):?string {
    $cipher=$p['password_cipher']??'';if($cipher==='')return null;
    if(!credentials_crypto_ready())throw new HubError('请启用 PHP OpenSSL 扩展及 AES-256-GCM 支持',503);
    $raw=str_starts_with($cipher,'v1:')?base64_decode(substr($cipher,3),true):false;
    if($raw===false||strlen($raw)<29||strlen($raw)>1024)throw new HubError('交付密码记录异常，请由总站重置客户密码',409);
    $password=openssl_decrypt(substr($raw,28),'aes-256-gcm',credential_key(),OPENSSL_RAW_DATA,substr($raw,0,12),substr($raw,12,16),'hub-project-credential:v1:'.$p['slug'].':'.$p['username']);
    if($password===false||!password_verify($password,$p['password_hash']))throw new HubError('交付密码校验失败，请检查密钥备份或由总站重置客户密码',409);
    return $password;
}
function delivery_credentials(array $p,?string $password):array {
    return ['username'=>$p['username'],'password'=>$password,'adminUrl'=>origin().'/p/'.$p['slug'].'/admin','landingUrl'=>origin().'/p/'.$p['slug']];
}
