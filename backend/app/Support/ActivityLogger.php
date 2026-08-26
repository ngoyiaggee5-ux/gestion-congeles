<?php

namespace App\Support;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;

class ActivityLogger
{
    public static function log(
        Request $request,
        string $action,
        string $entityType,
        ?int $entityId = null,
        ?string $summary = null,
        array $meta = []
    ): ActivityLog {
        $user = $request->user();

        return ActivityLog::create([
            'user_id' => $user?->id,
            'user_name' => $user?->name ?? 'Système',
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'summary' => $summary,
            'meta' => $meta ?: null,
        ]);
    }

    public static function logSale(Request $request, $sale): void
    {
        self::log(
            $request,
            'sale.created',
            'sale',
            $sale->id,
            "Vente {$sale->number} — {$sale->client_name} ({$sale->total} CDF)",
            ['total' => $sale->total, 'type' => $sale->type]
        );
    }

    public static function logPriceUpdate(Request $request, $product, array $changes): void
    {
        self::log(
            $request,
            'product.price_updated',
            'product',
            $product->id,
            "Prix modifié — {$product->name}",
            $changes
        );
    }

    public static function logInvoiceDelete(Request $request, $invoice): void
    {
        self::log(
            $request,
            'invoice.deleted',
            'invoice',
            $invoice->id,
            "Facture {$invoice->number} supprimée",
            ['total' => $invoice->total]
        );
    }
}
