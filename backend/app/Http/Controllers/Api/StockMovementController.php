<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockMovementController extends Controller
{
    public function index()
    {
        return StockMovement::with('product')->latest()->get();
    }

    public function available()
    {
        return Product::with('category')->orderBy('name')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'type' => 'required|in:entrée,sortie',
            'quantity' => 'required|integer|min:1',
            'unit_cost' => 'nullable|integer|min:0',
            'reference' => 'nullable|string|max:100',
            'note' => 'nullable|string|max:255',
        ]);

        return DB::transaction(function () use ($data) {
            $product = Product::lockForUpdate()->findOrFail($data['product_id']);

            if ($data['type'] === 'sortie' && $product->stock < $data['quantity']) {
                abort(422, 'Stock insuffisant');
            }

            if ($data['type'] === 'entrée') {
                $product->increment('stock', $data['quantity']);
            } else {
                $product->decrement('stock', $data['quantity']);
            }

            $movement = StockMovement::create([
                ...$data,
                'unit_cost' => $data['unit_cost'] ?? 0,
            ]);

            return response()->json($movement->load('product'), 201);
        });
    }
}
