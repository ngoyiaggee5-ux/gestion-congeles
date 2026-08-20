<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'API MBALA KWA SELEMANI — Gestion de congelé',
        'docs' => '/api/health',
    ]);
});
