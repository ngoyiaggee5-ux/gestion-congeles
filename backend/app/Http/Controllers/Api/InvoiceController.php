<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Sale;
use App\Support\ActivityLogger;
use App\Support\InvoiceVerification;
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

    public function verify(Request $request, string $number)
    {
        $code = $request->query('c');

        $invoice = Invoice::where('number', $number)->first();

        if (! $invoice) {
            return response()->json([
                'valid' => false,
                'message' => 'Facture introuvable ou numéro invalide.',
            ], 404);
        }

        if (! InvoiceVerification::isValid($invoice, $code)) {
            return response()->json([
                'valid' => false,
                'message' => 'Code de vérification invalide ou facture falsifiée.',
            ], 403);
        }

        $invoice->load('sale:id,number,type,payment_method');

        return response()->json([
            'valid' => true,
            'number' => $invoice->number,
            'total' => $invoice->total,
            'status' => $invoice->status,
            'client_name' => $invoice->client_name,
            'created_at' => $invoice->created_at?->toIso8601String(),
            'sale_number' => $invoice->sale?->number,
            'payment_method' => $invoice->sale?->payment_method,
            'signed' => true,
        ]);
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
            'verification_code' => InvoiceVerification::generateCode($invoiceNumber, (int) $sale->total),
        ]);

        return response()->json(
            $invoice->load(['sale.items.product', 'client']),
            201
        );
    }

    public function destroy(Request $request, Invoice $invoice)
    {
        ActivityLogger::logInvoiceDelete($request, $invoice);
        $invoice->delete();

        return response()->json(['message' => 'Facture supprimée']);
    }
}
