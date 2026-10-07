<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$candidates = [
    dirname(__DIR__),
    dirname(__DIR__, 2),
];

$root = null;
foreach ($candidates as $dir) {
    if (is_file($dir.'/.env') && is_file($dir.'/vendor/autoload.php')) {
        $root = $dir;
        break;
    }
}

if (! $root) {
    echo json_encode([
        'ok' => false,
        'error' => '.env ou vendor introuvable',
        'checked' => $candidates,
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

require $root.'/vendor/autoload.php';
$app = require $root.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$out = [
    'ok' => true,
    'root' => $root,
    'app_key_prefix' => substr((string) config('app.key'), 0, 20).'...',
    'cache_store' => config('cache.default'),
    'db_database' => config('database.connections.mysql.database'),
    'storage_writable' => is_writable($root.'/storage/framework'),
];

try {
    Illuminate\Support\Facades\Cache::put('diag_ping', 'ok', 60);
    $out['cache_ok'] = Illuminate\Support\Facades\Cache::get('diag_ping') === 'ok';
} catch (Throwable $e) {
    $out['cache_ok'] = false;
    $out['cache_error'] = $e->getMessage();
}

try {
    Illuminate\Support\Facades\DB::connection()->getPdo();
    $out['db_connected'] = true;
    $out['users_count'] = (int) Illuminate\Support\Facades\DB::table('users')->count();
    $out['tokens_table'] = Illuminate\Support\Facades\Schema::hasTable('personal_access_tokens');
    $out['products_has_cost_price'] = Illuminate\Support\Facades\Schema::hasColumn('products', 'cost_price');
    $out['sale_items_has_unit_cost'] = Illuminate\Support\Facades\Schema::hasColumn('sale_items', 'unit_cost');
} catch (Throwable $e) {
    $out['ok'] = false;
    $out['error'] = $e->getMessage();
}

echo json_encode($out, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
