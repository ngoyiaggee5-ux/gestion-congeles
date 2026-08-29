<?php

namespace App\Support;

use App\Models\Product;

class SalePricing
{
    public static function unitPrice(Product $product, string $saleType): int
    {
        return $saleType === 'gros'
            ? (int) $product->price_wholesale
            : (int) $product->price_retail;
    }

    public static function isWeightUnit(string $unit): bool
    {
        $u = strtolower(trim($unit));

        return $u === 'kg' || $u === 'g' || str_starts_with($u, 'kg') || str_contains($u, '/kg');
    }

    public static function quantityFromAmount(int $amount, int $unitPrice, string $unit = 'kg'): float
    {
        if ($unitPrice <= 0 || $amount <= 0) {
            return 0;
        }

        $raw = $amount / $unitPrice;

        if (self::isWeightUnit($unit)) {
            return round($raw, 3);
        }

        $whole = (int) floor($raw);

        return $whole >= 1 ? (float) $whole : 0;
    }

    /**
     * @param  array{product_id:int,quantity:float,line_total?:int|null}  $item
     * @return array{unit_price:int,line_total:int,quantity:float}
     */
    public static function resolveLine(Product $product, string $saleType, array $item): array
    {
        $quantity = (float) $item['quantity'];
        $unitPrice = self::unitPrice($product, $saleType);
        $clientLineTotal = isset($item['line_total']) ? (int) $item['line_total'] : null;

        if ($clientLineTotal !== null && $clientLineTotal > 0) {
            if ($saleType === 'gros') {
                abort(422, 'La vente au montant est réservée au détail.');
            }

            $expectedQuantity = self::quantityFromAmount($clientLineTotal, $unitPrice, $product->unit ?? 'kg');
            if (abs($expectedQuantity - $quantity) > 0.001) {
                abort(422, "Montant ou quantité incohérent pour {$product->name}.");
            }

            return [
                'unit_price' => $unitPrice,
                'line_total' => $clientLineTotal,
                'quantity' => $quantity,
            ];
        }

        return [
            'unit_price' => $unitPrice,
            'line_total' => (int) round($quantity * $unitPrice),
            'quantity' => $quantity,
        ];
    }
}
