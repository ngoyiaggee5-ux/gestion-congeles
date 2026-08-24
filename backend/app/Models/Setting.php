<?php

namespace App\Models;

class Setting extends Model
{
    protected $fillable = ['key', 'value'];

    protected function casts(): array
    {
        return ['value' => 'array'];
    }

    public static function getAppSettings(): array
    {
        $defaults = [
            'font' => 'dm-sans',
            'theme' => 'light',
            'currency' => 'CDF',
            'usdRate' => 2800,
        ];

        $row = static::where('key', 'app')->first();

        return $row ? array_merge($defaults, $row->value ?? []) : $defaults;
    }

    public static function saveAppSettings(array $settings): array
    {
        $current = static::getAppSettings();
        $merged = array_merge($current, $settings);

        static::updateOrCreate(
            ['key' => 'app'],
            ['value' => $merged]
        );

        return $merged;
    }
}
