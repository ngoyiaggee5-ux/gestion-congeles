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
            'palette' => 'forest',
            'currency' => 'CDF',
            'usdRate' => 2800,
        ];

        $row = static::where('key', 'app')->first();

        if (! $row) {
            return $defaults;
        }

        $value = $row->getAttribute('value');
        if (is_string($value)) {
            $value = json_decode($value, true);
        }

        return array_merge($defaults, is_array($value) ? $value : []);
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
