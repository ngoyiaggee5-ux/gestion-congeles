<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    protected $fillable = ['name', 'phone', 'email', 'type', 'address'];

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }
}
