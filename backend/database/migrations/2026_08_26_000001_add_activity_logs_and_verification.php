<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private function indexExists(string $table, string $index): bool
    {
        $connection = Schema::getConnection();

        if ($connection->getDriverName() === 'sqlite') {
            $indexes = $connection->select("PRAGMA index_list({$table})");
            foreach ($indexes as $idx) {
                if (($idx->name ?? '') === $index) {
                    return true;
                }
            }

            return false;
        }

        $database = $connection->getDatabaseName();

        $result = $connection->select(
            'SELECT COUNT(*) AS total FROM information_schema.statistics
             WHERE table_schema = ? AND table_name = ? AND index_name = ?',
            [$database, $table, $index]
        );

        return (int) ($result[0]->total ?? 0) > 0;
    }

    public function up(): void
    {
        if (! Schema::hasTable('activity_logs')) {
            Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('user_name');
            $table->string('action');
            $table->string('entity_type')->nullable();
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->string('summary');
            $table->json('meta')->nullable();
            $table->timestamps();
            });
        }

        Schema::table('invoices', function (Blueprint $table) {
            if (! Schema::hasColumn('invoices', 'verification_code')) {
                $table->string('verification_code', 32)->nullable()->after('status');
            }
        });

        if (! $this->indexExists('categories', 'categories_name_unique')) {
            Schema::table('categories', function (Blueprint $table) {
                $table->unique('name');
            });
        }

        if (! $this->indexExists('clients', 'clients_email_unique')) {
            Schema::table('clients', function (Blueprint $table) {
                $table->unique('email');
            });
        }

        if (Schema::hasTable('invoices')) {
            $invoices = DB::table('invoices')->select('id', 'number', 'total', 'verification_code')->get();
            foreach ($invoices as $invoice) {
                if ($invoice->verification_code) {
                    continue;
                }
                $code = substr(hash_hmac(
                    'sha256',
                    $invoice->number.'|'.$invoice->total,
                    config('app.key')
                ), 0, 16);
                DB::table('invoices')->where('id', $invoice->id)->update([
                    'verification_code' => $code,
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn('verification_code');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropUnique(['name']);
        });

        Schema::table('clients', function (Blueprint $table) {
            $table->dropUnique(['email']);
        });
    }
};
