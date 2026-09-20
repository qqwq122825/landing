<?php
declare(strict_types=1);
function hub_normalize_ip(string $ip): string {
    if (!filter_var($ip, FILTER_VALIDATE_IP)) return '';
    $packed=inet_pton($ip);
    // Normalize IPv4-mapped IPv6 before matching trusted CIDRs.
    if (strlen($packed)===16 && substr($packed,0,12)===str_repeat("\0",10)."\xff\xff") return inet_ntop(substr($packed,12));
    return inet_ntop($packed) ?: '';
}
function hub_ip_in_cidr(string $ip, string $cidr): bool {
    $parts=explode('/',$cidr,2);
    if (count($parts)!==2 || !ctype_digit($parts[1])) return false;
    $address=@inet_pton($ip); $network=@inet_pton($parts[0]); $bits=(int)$parts[1];
    if ($address===false || $network===false || strlen($address)!==strlen($network) || $bits>strlen($address)*8) return false;
    $bytes=intdiv($bits,8);$remaining=$bits%8;
    return substr($address,0,$bytes)===substr($network,0,$bytes) && (!$remaining || ((ord($address[$bytes]) ^ ord($network[$bytes])) & (255 << (8-$remaining)))===0);
}
function hub_cloudflare_request(): bool {
    global $config;
    if (($config['cloudflare_proxy_mode'] ?? 'auto')!=='auto') return false;
    // TV_PROXY_PEER may only be set by trusted server configuration (not an
    // HTTP_* request header) when Nginx has already rewritten REMOTE_ADDR.
    $peer=hub_normalize_ip($_SERVER['TV_PROXY_PEER'] ?? $_SERVER['REMOTE_ADDR'] ?? '');
    if ($peer==='') return false;
    static $ranges=null;
    if ($ranges===null) $ranges=is_file(__DIR__.'/cloudflare-ranges.php') ? require __DIR__.'/cloudflare-ranges.php' : [];
    foreach ($ranges as $range) if (hub_ip_in_cidr($peer,$range)) return true;
    return false;
}
function hub_cloudflare_visitor_ip(): string {
    if (!hub_cloudflare_request()) return '';
    $ip=hub_normalize_ip($_SERVER['HTTP_CF_CONNECTING_IP'] ?? '');
    // Cloudflare Pseudo IPv4 "Overwrite Headers" preserves the actual IPv6 here.
    if ($ip!=='' && hub_ip_in_cidr($ip,'240.0.0.0/4')) {
        $v6=hub_normalize_ip($_SERVER['HTTP_CF_CONNECTING_IPV6'] ?? '');
        if (strpos($v6,':')!==false) return $v6;
    }
    return $ip;
}
function hub_ip(): string {
    $visitor=hub_cloudflare_visitor_ip();
    return $visitor!=='' ? $visitor : hub_normalize_ip($_SERVER['REMOTE_ADDR'] ?? '');
}
function hub_geo_label(string $value): string {
    $value=trim(rawurldecode($value));
    if (strlen($value)>160 || !preg_match('//u',$value) || preg_match('/[<>\x00-\x1f\x7f]/u',$value)) return '';
    return $value;
}
function hub_visitor(): array {
    global $config;
    $ip = hub_ip();
    $ua = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 1000);
    $device = preg_match('/iPad|Tablet|Android(?!.*Mobile)/i', $ua) ? 'tablet' : (preg_match('/Mobile|iPhone|iPod/i', $ua) ? 'mobile' : (preg_match('/Windows|Macintosh|X11|Linux/i', $ua) ? 'desktop' : 'other'));
    $os = 'Other'; foreach (['Android'=>'Android','iPhone|iPad|iPod'=>'iOS','Windows'=>'Windows','Macintosh'=>'macOS','Linux'=>'Linux'] as $re=>$label) if (preg_match('/'.$re.'/i', $ua)) { $os=$label; break; }
    $browser = 'Other'; foreach (['Edg(?:e|A|iOS)?'=>'Edge','OPR|Opera|OPiOS'=>'Opera','SamsungBrowser'=>'Samsung Internet','Firefox|FxiOS'=>'Firefox','Chrome|CriOS'=>'Chrome','Safari'=>'Safari'] as $re=>$label) if (preg_match('/'.$re.'/i', $ua)) { $browser=$label; break; }
    $fromCloudflare = hub_cloudflare_visitor_ip()!=='';
    $country = $fromCloudflare ? strtoupper($_SERVER['HTTP_CF_IPCOUNTRY'] ?? '') : '';
    $region = $fromCloudflare ? hub_geo_label($_SERVER['HTTP_CF_REGION'] ?? '') : '';
    $city = $fromCloudflare ? hub_geo_label($_SERVER['HTTP_CF_IPCITY'] ?? '') : '';
    if (!preg_match('/^[A-Z]{2}$/D', $country) || in_array($country, ['XX','T1'], true)) $country = '';
    return ['visitor_hash'=>$ip === '' ? null : hash_hmac('sha256', $ip, $config['hash_key']), 'ip_address'=>$ip === '' ? null : $ip, 'country'=>$country, 'region'=>$region, 'city'=>$city, 'device'=>$device, 'os'=>$os, 'browser'=>$browser];
}
