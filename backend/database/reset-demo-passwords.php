<?php

/**
 * Réinitialise les mots de passe démo dans MySQL.
 * Usage : cd backend && php database/reset-demo-passwords.php
 */

require __DIR__.'/../vendor/autoload.php';

$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

// Colonnes NAME/PASSWORD (majuscules) → name/password pour Laravel
if (Schema::hasColumn('users', 'NAME')) {
    DB::statement('ALTER TABLE users CHANGE COLUMN `NAME` `name` VARCHAR(255) NOT NULL');
}
if (Schema::hasColumn('users', 'PASSWORD')) {
    DB::statement('ALTER TABLE users CHANGE COLUMN `PASSWORD` `password` VARCHAR(255) NOT NULL');
}

$accounts = [
    ['email' => 'admin@mbala-kwa.ci', 'password' => 'admin123', 'name' => 'Admin Principal', 'role' => 'admin'],
    ['email' => 'marie@mbala-kwa.ci', 'password' => 'vendeur123', 'name' => 'Marie Vendeur', 'role' => 'vendeur'],
    ['email' => 'manager@mbala-kwa.ci', 'password' => 'manager123', 'name' => 'Paul Manager', 'role' => 'manager'],
];

foreach ($accounts as $account) {
    $user = User::updateOrCreate(
        ['email' => $account['email']],
        [
            'name' => $account['name'],
            'password' => Hash::make($account['password']),
            'role' => $account['role'],
            'active' => true,
        ]
    );

    echo "OK {$user->email} (id {$user->id})\n";
}

echo "\nComptes prêts :\n";
echo "  admin@mbala-kwa.ci / admin123\n";
echo "  marie@mbala-kwa.ci / vendeur123\n";
echo "  manager@mbala-kwa.ci / manager123\n";
