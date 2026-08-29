<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('products')) {
            return;
        }

        DB::statement('ALTER TABLE products MODIFY stock DECIMAL(10,3) UNSIGNED NOT NULL DEFAULT 0');
        DB::statement('ALTER TABLE products MODIFY min_stock DECIMAL(10,3) UNSIGNED NOT NULL DEFAULT 0');

        if (Schema::hasTable('sale_items')) {
            DB::statement('ALTER TABLE sale_items MODIFY quantity DECIMAL(10,3) UNSIGNED NOT NULL');
        }

        if (Schema::hasTable('stock_movements')) {
            DB::statement('ALTER TABLE stock_movements MODIFY quantity DECIMAL(10,3) UNSIGNED NOT NULL');
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('products')) {
            return;
        }

        DB::statement('ALTER TABLE products MODIFY stock INT UNSIGNED NOT NULL DEFAULT 0');
        DB::statement('ALTER TABLE products MODIFY min_stock INT UNSIGNED NOT NULL DEFAULT 0');

        if (Schema::hasTable('sale_items')) {
            DB::statement('ALTER TABLE sale_items MODIFY quantity INT UNSIGNED NOT NULL');
        }

        if (Schema::hasTable('stock_movements')) {
            DB::statement('ALTER TABLE stock_movements MODIFY quantity INT UNSIGNED NOT NULL');
        }
    }
};
