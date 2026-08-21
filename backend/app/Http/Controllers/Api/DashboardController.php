<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Product;
use App\Models\Sale;

class DashboardController extends Controller
{
    public function index()
    {
        $products = Product::all();
        $totalStock = $products->sum('stock');
        $lowStock = $products->filter(fn ($p) => $p->stock <= $p->min_stock)->count();
        $salesTotal = Sale::sum('total');
        $salesCount = Sale::count();

        return response()->json([
            'total_stock' => $totalStock,
            'products_count' => $products->count(),
            'low_stock_count' => $lowStock,
            'sales_total' => $salesTotal,
            'sales_count' => $salesCount,
            'clients_count' => Client::count(),
        ]);
    }
}
