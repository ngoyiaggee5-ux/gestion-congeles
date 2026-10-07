<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;

class DataSync
{
    private const CACHE_KEY = 'mbala_app_sync_version';

    public static function bump(): void
    {
        Cache::forever(self::CACHE_KEY, (string) (int) round(microtime(true) * 1000));
    }

    public static function version(): string
    {
        $cached = Cache::get(self::CACHE_KEY);
        if ($cached) {
            return (string) $cached;
        }

        // Premier démarrage / cache vide
        $seed = (string) (int) round(microtime(true) * 1000);
        Cache::forever(self::CACHE_KEY, $seed);

        return $seed;
    }
}
