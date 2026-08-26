<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Category;
use App\Models\Client;
use App\Models\Invoice;
use App\Models\Product;
use App\Models\Sale;
use App\Models\Setting;
use App\Models\StockMovement;
use App\Models\User;
use App\Support\Permissions;
use Illuminate\Http\Request;

class AppStateController extends Controller
{
    public function index(Request $request)
    {
        $sales = Sale::with('items')->latest()->get()->map(fn ($sale) => [
            'id' => $sale->id,
            'number' => $sale->number,
            'type' => $sale->type,
            'client_id' => $sale->client_id,
            'client_name' => $sale->client_name,
            'items' => $sale->items->map(fn ($item) => [
                'product_id' => $item->product_id,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
            ])->values(),
            'payment_method' => $sale->payment_method,
            'status' => $sale->status,
            'total' => $sale->total,
            'created_at' => $sale->created_at?->toIso8601String(),
        ])->values();

        $users = [];
        if (Permissions::can($request->user()->role, Permissions::USERS_MANAGE)) {
            $users = User::orderBy('name')
                ->get(['id', 'name', 'email', 'role', 'active'])
                ->map(fn ($user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => Permissions::normalizeRole($user->role),
                    'active' => $user->active,
                ])
                ->values();
        }

        $activityLogs = [];
        if (Permissions::can($request->user()->role, Permissions::REPORTS_SALES)) {
            try {
                $activityLogs = ActivityLog::latest()->limit(50)->get();
            } catch (\Throwable) {
                $activityLogs = [];
            }
        }

        return response()->json([
            'categories' => Category::orderBy('name')->get(),
            'products' => Product::orderBy('name')->get(),
            'stockMovements' => StockMovement::latest()->get(),
            'clients' => Client::orderBy('name')->get(),
            'users' => $users,
            'sales' => $sales,
            'invoices' => Invoice::latest()->get(),
            'activityLogs' => $activityLogs,
            'settings' => Setting::getAppSettings(),
        ]);
    }
}
