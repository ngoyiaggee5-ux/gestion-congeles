<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$candidates = [
    dirname(__DIR__),
    dirname(__DIR__, 2),
];

$envPath = null;
foreach ($candidates as $dir) {
    if (is_file($dir.'/.env')) {
        $envPath = $dir.'/.env';
        break;
    }
}

if (! $envPath) {
    echo json_encode([
        'ok' => false,
        'error' => '.env introuvable',
        'hint' => 'Placez .env.hostinger dans public_html/api/.env sur Hostinger',
        'checked' => array_map(fn ($d) => $d.'/.env', $candidates),
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

$vars = [];
foreach (file($envPath, FILE_IGNORE_NEW_LINES) ?: [] as $line) {
    $line = trim($line);
    if ($line === '' || str_starts_with($line, '#') || ! str_contains($line, '=')) {
        continue;
    }
    [$key, $value] = explode('=', $line, 2);
    $value = trim($value, " \t\"'");
    $vars[$key] = $value;
}

$driver = $vars['DB_CONNECTION'] ?? 'mysql';

$out = [
    'ok' => true,
    'env_path' => $envPath,
    'db_connection' => $driver,
    'cache_store' => $vars['CACHE_STORE'] ?? '(absent)',
    'app_key_set' => ! empty($vars['APP_KEY']),
];

if ($driver === 'sqlite') {
    $dbFile = $vars['DB_DATABASE'] ?? 'database/database.sqlite';
    $full = str_starts_with($dbFile, DIRECTORY_SEPARATOR) || preg_match('/^[A-Za-z]:/', $dbFile)
        ? $dbFile
        : dirname($envPath).'/'.$dbFile;
    $out['sqlite_file'] = $full;
    $out['sqlite_exists'] = is_file($full);
    $out['db_connected'] = $out['sqlite_exists'];
} else {
    foreach (['DB_HOST', 'DB_DATABASE', 'DB_USERNAME', 'DB_PASSWORD'] as $key) {
        if (empty($vars[$key])) {
            echo json_encode(['ok' => false, 'error' => "Variable manquante: {$key}"], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    $out['db_database'] = $vars['DB_DATABASE'];
    $out['db_username'] = $vars['DB_USERNAME'];

    try {
        $dsn = 'mysql:host='.$vars['DB_HOST'].';dbname='.$vars['DB_DATABASE'].';charset=utf8mb4';
        $pdo = new PDO($dsn, $vars['DB_USERNAME'], $vars['DB_PASSWORD'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ]);
        $out['db_connected'] = true;
        $out['users_count'] = (int) $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
        $out['tokens_table'] = (bool) $pdo->query("SHOW TABLES LIKE 'personal_access_tokens'")->fetchColumn();
    } catch (Throwable $e) {
        $out['ok'] = false;
        $out['error'] = $e->getMessage();
    }
}

$storage = dirname($envPath).'/storage/framework';
$out['storage_writable'] = is_dir($storage) && is_writable($storage);

echo json_encode($out, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
