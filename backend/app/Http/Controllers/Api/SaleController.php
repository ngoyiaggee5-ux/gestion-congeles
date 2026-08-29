<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Product;
use App\Models\Sale;
use App\Models\StockMovement;
use App\Support\ActivityLogger;
use App\Support\InvoiceVerification;
use App\Support\Permissions;
use App\Support\SalePricing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        $query = Sale::with(['items.product', 'client', 'invoice'])->latest();

        if (! Permissions::can($request->user()->role, Permissions::REPORTS_SALES)) {
            $query->where('user_id', $request->user()->id);
        }

        return $query->get();
    }

    public function show(Request $request, Sale $sale)
    {
        $this->ensureSaleAccess($request, $sale);

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
            'items.*.quantity' => 'required|numeric|min:0.001',
            'items.*.line_total' => 'nullable|integer|min:1',
        ]);

        return DB::transaction(function () use ($data, $request) {
            $resolvedItems = [];
            $total = 0;

            foreach ($data['items'] as $item) {
                $product = Product::lockForUpdate()->findOrFail($item['product_id']);

                if ($product->stock < $item['quantity']) {
                    abort(422, "Stock insuffisant pour {$product->name}");
                }

                $line = SalePricing::resolveLine($product, $data['type'], $item);
                $resolvedItems[] = ['product' => $product, 'line' => $line];
                $total += $line['line_total'];
            }

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

            foreach ($resolvedItems as $entry) {
                $product = $entry['product'];
                $line = $entry['line'];

                $sale->items()->create([
                    'product_id' => $product->id,
                    'quantity' => $line['quantity'],
                    'unit_price' => $line['unit_price'],
                    'line_total' => $line['line_total'],
                ]);
                $product->decrement('stock', $line['quantity']);

                StockMovement::create([
                    'product_id' => $product->id,
                    'type' => 'sortie',
                    'quantity' => $line['quantity'],
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

    public function destroy(Request $request, Sale $sale)
    {
        $this->ensureSaleAccess($request, $sale);
        $sale->delete();

        return response()->json(['message' => 'Vente supprimée']);
    }

    private function ensureSaleAccess(Request $request, Sale $sale): void
    {
        if (Permissions::can($request->user()->role, Permissions::REPORTS_SALES)) {
            return;
        }

        if ($sale->user_id !== $request->user()->id) {
            abort(403, 'Accès refusé pour cette vente.');
        }
    }
}
