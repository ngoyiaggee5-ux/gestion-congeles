<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model as EloquentModel;

/**
 * Normalise les attributs JSON (NAME → name) pour MySQL/XAMPP.
 */
abstract class Model extends EloquentModel
{
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
