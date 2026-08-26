<?php

use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\AppStateController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\StockMovementController;
use App\Http\Controllers\Api\UserController;
use App\Support\Permissions as P;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json([
    'status' => 'ok',
    'app' => 'MBALA KWA SELEMANI',
]));

Route::prefix('v1')->group(function () {
    Route::get('/public/invoices/verify/{number}', [InvoiceController::class, 'verify']);
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);

        Route::get('/activity-logs', [ActivityLogController::class, 'index'])
            ->middleware('role:'.P::REPORTS_SALES);

        Route::get('/app-state', [AppStateController::class, 'index'])
            ->middleware('role:'.P::DASHBOARD);

        Route::get('/dashboard', [DashboardController::class, 'index'])
            ->middleware('role:'.P::DASHBOARD);

        Route::get('/settings', [SettingController::class, 'show'])
            ->middleware('role:'.P::SETTINGS_MANAGE);
        Route::put('/settings', [SettingController::class, 'update'])
            ->middleware('role:'.P::SETTINGS_MANAGE);

        Route::get('/categories', [CategoryController::class, 'index'])
            ->middleware('role:'.P::PRODUCTS_VIEW.','.P::PRODUCTS_MANAGE);
        Route::post('/categories', [CategoryController::class, 'store'])
            ->middleware('role:'.P::PRODUCTS_MANAGE);
        Route::get('/categories/{category}', [CategoryController::class, 'show'])
            ->middleware('role:'.P::PRODUCTS_VIEW.','.P::PRODUCTS_MANAGE);
        Route::put('/categories/{category}', [CategoryController::class, 'update'])
            ->middleware('role:'.P::PRODUCTS_MANAGE);
        Route::patch('/categories/{category}', [CategoryController::class, 'update'])
            ->middleware('role:'.P::PRODUCTS_MANAGE);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])
            ->middleware('role:'.P::CATEGORIES_DELETE);

        Route::get('/products', [ProductController::class, 'index'])
            ->middleware('role:'.P::PRODUCTS_VIEW.','.P::PRODUCTS_MANAGE);
        Route::post('/products', [ProductController::class, 'store'])
            ->middleware('role:'.P::PRODUCTS_MANAGE);
        Route::get('/products/{product}', [ProductController::class, 'show'])
            ->middleware('role:'.P::PRODUCTS_VIEW.','.P::PRODUCTS_MANAGE);
        Route::put('/products/{product}', [ProductController::class, 'update'])
            ->middleware('role:'.P::PRODUCTS_MANAGE);
        Route::patch('/products/{product}', [ProductController::class, 'update'])
            ->middleware('role:'.P::PRODUCTS_MANAGE);
        Route::delete('/products/{product}', [ProductController::class, 'destroy'])
            ->middleware('role:'.P::PRODUCTS_DELETE);

        Route::get('/clients', [ClientController::class, 'index'])
            ->middleware('role:'.P::CLIENTS_MANAGE);
        Route::post('/clients', [ClientController::class, 'store'])
            ->middleware('role:'.P::CLIENTS_MANAGE);
        Route::get('/clients/{client}', [ClientController::class, 'show'])
            ->middleware('role:'.P::CLIENTS_MANAGE);
        Route::put('/clients/{client}', [ClientController::class, 'update'])
            ->middleware('role:'.P::CLIENTS_MANAGE);
        Route::patch('/clients/{client}', [ClientController::class, 'update'])
            ->middleware('role:'.P::CLIENTS_MANAGE);
        Route::delete('/clients/{client}', [ClientController::class, 'destroy'])
            ->middleware('role:'.P::CLIENTS_DELETE);

        Route::get('/users', [UserController::class, 'index'])
            ->middleware('role:'.P::USERS_MANAGE);
        Route::post('/users', [UserController::class, 'store'])
            ->middleware('role:'.P::USERS_MANAGE);
        Route::get('/users/{user}', [UserController::class, 'show'])
            ->middleware('role:'.P::USERS_MANAGE);
        Route::put('/users/{user}', [UserController::class, 'update'])
            ->middleware('role:'.P::USERS_MANAGE);
        Route::patch('/users/{user}', [UserController::class, 'update'])
            ->middleware('role:'.P::USERS_MANAGE);
        Route::delete('/users/{user}', [UserController::class, 'destroy'])
            ->middleware('role:'.P::USERS_DELETE);

        Route::get('/stock-movements', [StockMovementController::class, 'index'])
            ->middleware('role:'.P::STOCK_VIEW.','.P::STOCK_MANAGE);
        Route::post('/stock-movements', [StockMovementController::class, 'store'])
            ->middleware('role:'.P::STOCK_MANAGE);
        Route::get('/stock', [StockMovementController::class, 'available'])
            ->middleware('role:'.P::STOCK_VIEW.','.P::STOCK_MANAGE);

        Route::get('/sales', [SaleController::class, 'index'])
            ->middleware('role:'.P::BILLING_HISTORY.','.P::SALES_PAYMENT);
        Route::post('/sales', [SaleController::class, 'store'])
            ->middleware('role:'.P::SALES_PAYMENT.','.P::SALES_DETAIL.','.P::SALES_GROS);
        Route::get('/sales/{sale}', [SaleController::class, 'show'])
            ->middleware('role:'.P::BILLING_HISTORY.','.P::SALES_PAYMENT);
        Route::delete('/sales/{sale}', [SaleController::class, 'destroy'])
            ->middleware('role:'.P::SALES_DELETE);

        Route::get('/invoices', [InvoiceController::class, 'index'])
            ->middleware('role:'.P::BILLING_HISTORY);
        Route::post('/invoices', [InvoiceController::class, 'store'])
            ->middleware('role:'.P::BILLING_GENERATE);
        Route::get('/invoices/{invoice}', [InvoiceController::class, 'show'])
            ->middleware('role:'.P::BILLING_HISTORY);
        Route::delete('/invoices/{invoice}', [InvoiceController::class, 'destroy'])
            ->middleware('role:'.P::BILLING_DELETE);

        Route::get('/reports/sales', [ReportController::class, 'sales'])
            ->middleware('role:'.P::REPORTS_SALES);
        Route::get('/reports/stock', [ReportController::class, 'stock'])
            ->middleware('role:'.P::REPORTS_STOCK);
        Route::get('/reports/profits', [ReportController::class, 'profits'])
            ->middleware('role:'.P::REPORTS_PROFIT);
    });
});
