<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Sale;

class ReportController extends Controller
{
    public function sales()
    {
        return Sale::with(['items.product', 'client'])->latest()->get();
    }

    public function stock()
    {
        return Product::with('category')->orderBy('name')->get();
    }

    public function profits()
    {
        $sales = Sale::with('items.product')->latest()->get();

        return $sales->map(function (Sale $sale) {
            $cost = $sale->items->sum(function ($item) {
                return ($item->product->price_wholesale * 0.75) * $item->quantity;
            });

            return [
                'sale_id' => $sale->id,
                'number' => $sale->number,
                'total' => $sale->total,
                'cost' => (int) round($cost),
                'profit' => (int) round($sale->total - $cost),
                'created_at' => $sale->created_at,
            ];
        });
    }
}
