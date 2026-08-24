<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Sale;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function index()
    {
        return Invoice::with(['sale.items.product', 'client'])->latest()->get();
    }

    public function show(Invoice $invoice)
    {
        return $invoice->load(['sale.items.product', 'client']);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'sale_id' => 'required|exists:sales,id',
        ]);

        $sale = Sale::with('invoice')->findOrFail($data['sale_id']);

        if ($sale->invoice) {
            return response()->json($sale->invoice->load(['sale.items.product', 'client']));
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
            'total' => $sale->total,
            'status' => 'émise',
        ]);

        return response()->json(
            $invoice->load(['sale.items.product', 'client']),
            201
        );
    }

    public function destroy(Invoice $invoice)
    {
        $invoice->delete();

        return response()->json(['message' => 'Facture supprimée']);
    }
}
