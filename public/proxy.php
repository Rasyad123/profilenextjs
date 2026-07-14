<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Referer');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$action = $_GET['action'] ?? '';

// ─── TikTok Download ────────────────────────────────────────────
if ($action === 'tiktok') {
    $videoUrl = $_GET['url'] ?? '';
    if (!$videoUrl) {
        http_response_code(400);
        echo json_encode(['error' => 'URL is required']);
        exit;
    }

    // tikwm only works with short URLs, so we resolve full URLs first
    $resolved = $videoUrl;
    if (preg_match('/tiktok\.com\/@[^\/]+\/video\//', $videoUrl)) {
        // It's a full URL — resolve it to get the final URL
        $ch = curl_init($videoUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_NOBODY, true);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0');
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_exec($ch);
        $finalUrl = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
        curl_close($ch);
        $resolved = $finalUrl ?: $videoUrl;
    }

    // Call tikwm API
    $ch = curl_init('https://tikwm.com/api/');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
        'url' => $resolved,
        'web' => 1,
        'hd' => 1
    ]));
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0');
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200 || !$response) {
        http_response_code(502);
        echo json_encode(['error' => 'Failed to reach TikTok API']);
        exit;
    }

    echo $response;
    exit;
}

// ─── Instagram Download ─────────────────────────────────────────
if ($action === 'instagram') {
    $videoUrl = $_GET['url'] ?? '';
    if (!$videoUrl) {
        http_response_code(400);
        echo json_encode(['error' => 'URL is required']);
        exit;
    }

    function fetchIg($url, $apiUrl, $origin) {
        $ch = curl_init($apiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
            'q' => $url,
            't' => 'media',
            'lang' => 'en'
        ]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/x-www-form-urlencoded',
            'X-Requested-With: XMLHttpRequest',
            "Origin: $origin",
            "Referer: $origin/",
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return [$httpCode, $response];
    }

    // Try Snapinsta
    list($code, $res) = fetchIg($videoUrl, 'https://snapinsta.app/action.php', 'https://snapinsta.app');
    
    // Fallback to SaveIG if Snapinsta fails
    if ($code !== 200 || !$res) {
        list($code, $res) = fetchIg($videoUrl, 'https://saveig.app/api/ajaxSearch', 'https://saveig.app');
    }

    // Fallback to itzpire
    if ($code !== 200 || !$res || strpos($res, '<title>Just a moment...</title>') !== false || strpos($res, 'Cloudflare') !== false) {
        list($code, $res) = fetchIg($videoUrl, 'https://itzpire.com/download/instagram?url=' . urlencode($videoUrl), 'https://itzpire.com');
    }

    if ($code !== 200 || !$res) {
        http_response_code(502);
        echo json_encode(['error' => 'Failed to reach Instagram API via all proxies', 'last_code' => $code]);
        exit;
    }

    header('Content-Type: text/html; charset=utf-8');
    echo $res;
    exit;
}

// ─── Generic Proxy (Pinterest, Facebook, etc.) ──────────────────
if ($action === 'proxy') {
    $url = $_GET['url'] ?? '';
    if (!$url) {
        http_response_code(400);
        echo json_encode(['error' => 'URL is required']);
        exit;
    }

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    curl_setopt($ch, CURLOPT_TIMEOUT, 20);

    // Forward request method
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $_SERVER['REQUEST_METHOD']);

    // Forward POST data if any
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $postData = file_get_contents('php://input');
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    curl_close($ch);

    http_response_code($httpCode ?: 502);
    if ($contentType) {
        header('Content-Type: ' . $contentType);
    }
    echo $response;
    exit;
}

// ─── Download file (stream through proxy to avoid CORS) ─────────
if ($action === 'download') {
    $url = $_GET['url'] ?? '';
    if (!$url) {
        http_response_code(400);
        echo json_encode(['error' => 'URL is required']);
        exit;
    }

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0');
    curl_setopt($ch, CURLOPT_TIMEOUT, 60);
    $data = curl_exec($ch);
    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE) ?: 'application/octet-stream';
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if (!$data || $httpCode !== 200) {
        http_response_code(502);
        echo json_encode(['error' => 'Failed to download file']);
        exit;
    }

    header('Content-Type: ' . $contentType);
    header('Content-Disposition: attachment');
    header('Content-Length: ' . strlen($data));
    echo $data;
    exit;
}

// ─── No valid action ────────────────────────────────────────────
http_response_code(400);
echo json_encode([
    'error' => 'Invalid action. Use: tiktok, instagram, proxy, download',
    'usage' => [
        'tiktok' => '/proxy.php?action=tiktok&url=TIKTOK_URL',
        'instagram' => '/proxy.php?action=instagram&url=INSTAGRAM_URL',
        'proxy' => '/proxy.php?action=proxy&url=ANY_URL',
        'download' => '/proxy.php?action=download&url=FILE_URL',
    ]
]);
