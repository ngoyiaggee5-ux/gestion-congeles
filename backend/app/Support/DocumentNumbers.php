<?php

namespace App\Support;

use App\Models\Invoice;
use App\Models\Sale;

class DocumentNumbers
{
    public static function nextSaleNumber(): string
    {
        return self::next('VT', Sale::class, 'number');
    }

    public static function nextInvoiceNumber(): string
    {
        return self::next('FA', Invoice::class, 'number');
    }

    /**
     * Génère un numéro unique séquentiel par année (ex. FA-2026-0008).
     * Doit être appelé dans une transaction DB.
     */
    private static function next(string $prefix, string $model, string $column): string
    {
        $year = now()->format('Y');
        $like = "{$prefix}-{$year}-%";

        $last = $model::query()
            ->where($column, 'like', $like)
            ->lockForUpdate()
            ->orderByDesc($column)
            ->value($column);

        $seq = 1;
        if (is_string($last) && preg_match('/-(\d+)$/', $last, $m)) {
            $seq = ((int) $m[1]) + 1;
        }

        return sprintf('%s-%s-%04d', $prefix, $year, $seq);
    }
}
