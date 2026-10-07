<?php

namespace App\Support;

use App\Models\Product;

class ProductCost
{
    /**
     * Met à jour le coût moyen pondéré après une entrée de stock.
     */
    public static function applyInbound(Product $product, float $quantity, int $unitCost): void
    {
        if ($quantity <= 0 || $unitCost < 0) {
            return;
        }

        $stockBefore = max(0, (float) $product->stock);
        $oldCost = (int) ($product->cost_price ?? 0);

        if ($stockBefore <= 0 || $oldCost <= 0) {
            $product->cost_price = $unitCost;
        } else {
            $totalQty = $stockBefore + $quantity;
            $product->cost_price = (int) round(
                (($stockBefore * $oldCost) + ($quantity * $unitCost)) / $totalQty
            );
        }

        $product->save();
    }

    public static function resolveUnitCost(?Product $product, $itemUnitCost = null): int
    {
        $fromItem = (int) ($itemUnitCost ?? 0);
        if ($fromItem > 0) {
            return $fromItem;
        }

        return (int) ($product?->cost_price ?? 0);
    }
}
