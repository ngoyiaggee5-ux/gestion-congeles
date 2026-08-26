<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Product;
use App\Models\Sale;
use App\Models\StockMovement;
use App\Support\ActivityLogger;
use App\Support\InvoiceVerification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    public function index()
    {
        return Sale::with(['items.product', 'client', 'invoice'])
            ->latest()
            ->get();
    }

    public function show(Sale $sale)
    {
        return $sale->load(['items.product', 'client', 'invoice']);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'type' => 'required|in:détail,gros',
            'client_id' => 'nullable|exists:clients,id',
            'client_name' => 'required|string|max:255',
            'payment_method' => 'required|string|max:50',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|integer|min:0',
        ]);

        return DB::transaction(function () use ($data, $request) {
            $total = collect($data['items'])->sum(
                fn ($item) => $item['quantity'] * $item['unit_price']
            );

            $saleNumber = 'VT-'.now()->format('Y').'-'.str_pad(
                Sale::count() + 1,
                4,
                '0',
                STR_PAD_LEFT
            );

            $sale = Sale::create([
                'number' => $saleNumber,
                'type' => $data['type'],
                'client_id' => $data['client_id'] ?? null,
                'client_name' => $data['client_name'],
                'payment_method' => $data['payment_method'],
                'status' => 'payée',
                'total' => $total,
                'user_id' => $request->user()?->id,
            ]);

            foreach ($data['items'] as $item) {
                $product = Product::lockForUpdate()->findOrFail($item['product_id']);

                if ($product->stock < $item['quantity']) {
                    abort(422, "Stock insuffisant pour {$product->name}");
                }

                $sale->items()->create($item);
                $product->decrement('stock', $item['quantity']);

                StockMovement::create([
                    'product_id' => $product->id,
                    'type' => 'sortie',
                    'quantity' => $item['quantity'],
                    'unit_cost' => 0,
                    'reference' => $saleNumber,
                    'note' => "Vente {$data['type']}",
                ]);
            }

            $invoiceNumber = 'FA-'.now()->format('Y').'-'.str_pad(
                Invoice::count() + 1,
                4,
                '0',
                STR_PAD_LEFT
            );

            $invoice = Invoice::create([
                'number' => $invoiceNumber,
                'sale_id' => $sale->id,
                'client_id' => $sale->client_id,
                'client_name' => $sale->client_name,
                'total' => $total,
                'status' => 'émise',
                'verification_code' => InvoiceVerification::generateCode($invoiceNumber, $total),
            ]);

            ActivityLogger::logSale($request, $sale);

            return response()->json(
                $sale->load(['items.product', 'client', 'invoice']),
                201
            );
        });
    }

    public function destroy(Sale $sale)
    {
        $sale->delete();

        return response()->json(['message' => 'Vente supprimée']);
    }
}
