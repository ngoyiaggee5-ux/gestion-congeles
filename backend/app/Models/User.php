<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = ['name', 'email', 'password', 'role', 'active'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
        ];
    }

    public function toArray()
    {
        $array = parent::toArray();
        $normalized = [];

        foreach ($array as $key => $value) {
            $normalized[is_string($key) ? strtolower($key) : $key] = $value;
        }

        return $normalized;
    }

    public function getAttribute($key)
    {
        if (array_key_exists($key, $this->attributes ?? [])) {
            return parent::getAttribute($key);
        }

        if (is_string($key)) {
            $upper = strtoupper($key);
            if (array_key_exists($upper, $this->attributes ?? [])) {
                return parent::getAttribute($upper);
            }
        }

        return parent::getAttribute($key);
    }

    public function setAttribute($key, $value)
    {
        if (is_string($key) && ! array_key_exists($key, $this->attributes ?? [])) {
            $upper = strtoupper($key);
            if (array_key_exists($upper, $this->attributes ?? [])) {
                return parent::setAttribute($upper, $value);
            }
        }

        return parent::setAttribute($key, $value);
    }
}
