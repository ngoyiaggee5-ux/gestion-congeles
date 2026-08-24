<?php

/**
 * Renomme les colonnes MySQL en majuscules vers le format Laravel (minuscules).
 * Usage : cd backend && php database/fix-column-case.php
 */

require __DIR__.'/../vendor/autoload.php';

$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

$renames = [
    'users' => [
        'NAME' => "ALTER TABLE users CHANGE COLUMN `NAME` `name` VARCHAR(255) NOT NULL",
        'PASSWORD' => "ALTER TABLE users CHANGE COLUMN `PASSWORD` `password` VARCHAR(255) NOT NULL",
    ],
    'categories' => [
        'NAME' => "ALTER TABLE categories CHANGE COLUMN `NAME` `name` VARCHAR(255) NOT NULL",
    ],
    'products' => [
        'NAME' => "ALTER TABLE products CHANGE COLUMN `NAME` `name` VARCHAR(255) NOT NULL",
    ],
    'clients' => [
        'NAME' => "ALTER TABLE clients CHANGE COLUMN `NAME` `name` VARCHAR(255) NOT NULL",
        'TYPE' => "ALTER TABLE clients CHANGE COLUMN `TYPE` `type` ENUM('détail','gros') NOT NULL DEFAULT 'détail'",
    ],
    'sales' => [
        'NUMBER' => "ALTER TABLE sales CHANGE COLUMN `NUMBER` `number` VARCHAR(255) NOT NULL",
        'TYPE' => "ALTER TABLE sales CHANGE COLUMN `TYPE` `type` ENUM('détail','gros') NOT NULL",
        'STATUS' => "ALTER TABLE sales CHANGE COLUMN `STATUS` `status` ENUM('payée','annulée') NOT NULL DEFAULT 'payée'",
    ],
    'invoices' => [
        'NUMBER' => "ALTER TABLE invoices CHANGE COLUMN `NUMBER` `number` VARCHAR(255) NOT NULL",
        'STATUS' => "ALTER TABLE invoices CHANGE COLUMN `STATUS` `status` ENUM('émise','payée','annulée') NOT NULL DEFAULT 'émise'",
    ],
    'stock_movements' => [
        'TYPE' => "ALTER TABLE stock_movements CHANGE COLUMN `TYPE` `type` ENUM('entrée','sortie') NOT NULL",
    ],
    'settings' => [
        'VALUE' => "ALTER TABLE settings CHANGE COLUMN `VALUE` `value` JSON NOT NULL",
    ],
];

foreach ($renames as $table => $columns) {
    if (! Schema::hasTable($table)) {
        echo "SKIP {$table} (table absente)\n";
        continue;
    }

    foreach ($columns as $upper => $sql) {
        if (Schema::hasColumn($table, $upper)) {
            DB::statement($sql);
            echo "OK {$table}.{$upper} → ".strtolower($upper)."\n";
        } else {
            echo "OK {$table}.".strtolower($upper)." (déjà correct)\n";
        }
    }
}

echo "\nColonnes corrigées. Relancez l'API si elle tourne.\n";
