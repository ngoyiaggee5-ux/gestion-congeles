<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Sale;
use App\Support\ActivityLogger;
use App\Support\InvoiceVerification;
use App\Support\Permissions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Invoice::with(['sale.items.product', 'client'])->latest();

        if (! Permissions::can($request->user()->role, Permissions::REPORTS_SALES)) {
            $query->whereHas('sale', fn ($q) => $q->where('user_id', $request->user()->id));
        }

        return $query->get();
    }

    public function show(Request $request, Invoice $invoice)
    {
        $this->ensureInvoiceAccess($request, $invoice);

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

    public function destroy(Request $request, int $invoice)
    {
        $record = Invoice::find($invoice);

        if (! $record) {
            return response()->json([
                'message' => 'Facture déjà supprimée ou introuvable.',
            ], 404);
        }

        try {
            ActivityLogger::logInvoiceDelete($request, $record);
        } catch (\Throwable) {
            // Ne pas bloquer la suppression si le journal d'activité est indisponible.
        }

        $record->delete();

        return response()->json(['message' => 'Facture supprimée']);
    }

    public function destroyAll(Request $request)
    {
        return DB::transaction(function () use ($request) {
            $count = Invoice::count();

            if ($count === 0) {
                return response()->json(['message' => 'Aucune facture à supprimer.', 'deleted' => 0]);
            }

            try {
                ActivityLogger::log(
                    $request,
                    'invoice.purged',
                    'invoice',
                    null,
                    "Historique factures vidé — {$count} facture(s) supprimée(s)",
                    ['deleted' => $count]
                );
            } catch (\Throwable) {
                // Ne pas bloquer la suppression si le journal d'activité est indisponible.
            }

            Invoice::query()->delete();

            return response()->json([
                'message' => "{$count} facture(s) supprimée(s).",
                'deleted' => $count,
            ]);
        });
    }

    private function ensureInvoiceAccess(Request $request, Invoice $invoice): void
    {
        if (Permissions::can($request->user()->role, Permissions::REPORTS_SALES)) {
            return;
        }

        $invoice->loadMissing('sale:id,user_id');
        if ($invoice->sale?->user_id !== $request->user()->id) {
            abort(403, 'Accès refusé pour cette facture.');
        }
    }
}

