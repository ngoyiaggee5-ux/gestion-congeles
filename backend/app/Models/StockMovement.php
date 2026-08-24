<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
    protected $fillable = [
        'product_id', 'type', 'quantity', 'unit_cost', 'reference', 'note',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
