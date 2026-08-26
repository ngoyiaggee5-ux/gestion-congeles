<?php

namespace App\Support;

use App\Models\Invoice;

class InvoiceVerification
{
    public static function generateCode(string $number, int $total): string
    {
        return substr(hash_hmac('sha256', $number.'|'.$total, config('app.key')), 0, 16);
    }

    public static function ensureCode(Invoice $invoice): string
    {
        if ($invoice->verification_code) {
            return $invoice->verification_code;
        }

        $code = self::generateCode($invoice->number, (int) $invoice->total);
        $invoice->forceFill(['verification_code' => $code])->save();

        return $code;
    }

    public static function isValid(Invoice $invoice, ?string $code): bool
    {
        if (! $code) {
            return false;
        }

        $expected = $invoice->verification_code ?: self::generateCode(
            $invoice->number,
            (int) $invoice->total
        );

        return hash_equals($expected, $code);
    }
}
