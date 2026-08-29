<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('sale_items')) {
            return;
        }

        if (! Schema::hasColumn('sale_items', 'line_total')) {
            Schema::table('sale_items', function (Blueprint $table) {
                $table->unsignedInteger('line_total')->nullable()->after('unit_price');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('sale_items')) {
            return;
        }

        if (Schema::hasColumn('sale_items', 'line_total')) {
            Schema::table('sale_items', function (Blueprint $table) {
                $table->dropColumn('line_total');
            });
        }
    }
};
