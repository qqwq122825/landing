<?php
declare(strict_types=1);

// Deliberately standalone: loading bootstrap / installer checks could create data.
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}
if (in_array('--help', $argv, true)) {
    echo "用法：php bin/check.php\n只读检查 CLI PHP、核心文件和数据目录权限；不安装、不生成数据。\n";
    exit(0);
}

$root = dirname(__DIR__);
$failed = 0;
$check = static function (string $label, bool $ok) use (&$failed): void {
    echo ($ok ? '[OK]   ' : '[FAIL] ').$label.PHP_EOL;
    if (!$ok) $failed++;
};

echo "LANDING HUB · 部署预检（只读，无需 Node / npm / dist）\n\n";
$check('PHP >= 8.1（当前 '.PHP_VERSION.'）', PHP_VERSION_ID >= 80100);
$check('PDO SQLite', class_exists('PDO') && in_array('sqlite', PDO::getAvailableDrivers(), true));
$check('mbstring', extension_loaded('mbstring'));
$check('OpenSSL AES-256-GCM', function_exists('openssl_encrypt') && function_exists('openssl_decrypt')
    && function_exists('openssl_get_cipher_methods') && in_array('aes-256-gcm', openssl_get_cipher_methods(), true));
$check('会话支持', function_exists('session_start'));
$check('图像信息读取', function_exists('getimagesizefromstring'));

$required = [
    'app/bootstrap.php', 'app/routes.php', 'app/analytics.php', 'app/credentials.php',
    'app/geo.php', 'app/cloudflare-ranges.php', 'app/install-service.php', 'app/installer.php',
    'app/console.html', 'app/tenant.html', 'public/index.php', 'public/install.php',
    'public/assets/console.js', 'public/assets/console.css',
    'public/assets/tenant.js', 'public/assets/tenant.css', 'public/assets/install.css',
    'public/assets/brand-settings.js', 'public/assets/collector.js',
    'public/assets/vendor/tabler-1.5.1/tabler.min.css',
    'public/assets/vendor/tabler-1.5.1/tabler.min.js',
    'resources/pages/feiyue.html', 'resources/pages/dptv.html',
];
$missing = array_filter($required, static function (string $file) use ($root): bool {
    return !is_file($root.'/'.$file) || !is_readable($root.'/'.$file);
});
$check('核心程序与本地 UI 资源', !$missing);
foreach ($missing as $file) echo '       缺失或不可读：'.$file.PHP_EOL;
foreach (['feiyue', 'dptv'] as $template) {
    $check('模板资源目录：'.$template, is_dir($root.'/public/themes/'.$template)
        && is_readable($root.'/public/themes/'.$template));
}

$data = getenv('HUB_DATA_DIR') ?: $root.'/runtime';
$dataPath = realpath($data);
$publicPath = realpath($root.'/public');
$check('数据目录存在且当前 CLI 用户可读写', is_dir($data) && is_readable($data) && is_writable($data));
if ($dataPath !== false && $publicPath !== false) {
    // Compare canonical paths, including a HUB_DATA_DIR symlink pointing into public/.
    $check('数据目录位于 public 之外', $dataPath !== $publicPath
        && strpos($dataPath, $publicPath.DIRECTORY_SEPARATOR) !== 0);
}
echo "\n[INFO] ".(is_file($data.'/install.lock')
    ? '已有安装锁：代码更新保留此文件，无需重新安装。'
    : '未发现安装锁：首次上线配置好站点后访问 /install.php；已有数据先核对 HUB_DATA_DIR。').PHP_EOL;
echo "[INFO] 此检查不读取数据库或密钥内容、不创建目录、不修改权限。\n";
echo "[INFO] CLI 与 PHP-FPM 可能使用不同 PHP / 用户 / 环境变量，网页环境请另外核对。\n";
echo "[INFO] HTTPS、伪静态、完整模板资源与线上功能仍需按 deploy/README.md 验收。\n\n";
echo $failed ? "预检发现 {$failed} 项问题，请按 [FAIL] 提示处理。\n" : "预检通过；程序使用已提交的 public/ 资源，无前端构建步骤。\n";
exit($failed ? 1 : 0);
