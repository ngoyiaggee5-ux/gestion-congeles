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
        $user = $request->user();
        $role = $user->role;
        $canViewAllSales = Permissions::can($role, Permissions::REPORTS_SALES);

        $salesQuery = Sale::with('items')->latest();
        if (! $canViewAllSales) {
            $salesQuery->where('user_id', $user->id);
        }

        $sales = $salesQuery->get()->map(fn ($sale) => [
            'id' => $sale->id,
            'number' => $sale->number,
            'type' => $sale->type,
            'client_id' => $sale->client_id,
            'client_name' => $sale->client_name,
            'items' => $sale->items->map(fn ($item) => [
                'product_id' => $item->product_id,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'line_total' => $item->line_total,
            ])->values(),
            'payment_method' => $sale->payment_method,
            'status' => $sale->status,
            'total' => $sale->total,
            'created_at' => $sale->created_at?->toIso8601String(),
        ])->values();

        $invoicesQuery = Invoice::with('sale:id,user_id')->latest();
        if (! $canViewAllSales) {
            $invoicesQuery->whereHas('sale', fn ($q) => $q->where('user_id', $user->id));
        }

        $users = [];
        if (Permissions::can($role, Permissions::USERS_MANAGE)) {
            $users = User::orderBy('name')
                ->get(['id', 'name', 'email', 'role', 'active'])
                ->map(fn ($u) => [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'role' => Permissions::normalizeRole($u->role),
                    'active' => $u->active,
                ])
                ->values();
        }

        $activityLogs = [];
        if (Permissions::can($role, Permissions::REPORTS_SALES)) {
            try {
                $activityLogs = ActivityLog::latest()->limit(50)->get();
            } catch (\Throwable) {
                $activityLogs = [];
            }
        }

        $stockMovements = [];
        if (Permissions::can($role, Permissions::STOCK_VIEW) || Permissions::can($role, Permissions::STOCK_MANAGE)) {
            $stockMovements = StockMovement::latest()->limit($canViewAllSales ? 500 : 100)->get();
        }

        return response()->json([
            'categories' => Category::orderBy('name')->get(),
            'products' => Product::orderBy('name')->get(),
            'stockMovements' => $stockMovements,
            'clients' => Permissions::can($role, Permissions::CLIENTS_MANAGE)
                ? Client::orderBy('name')->get()
                : [],
            'users' => $users,
            'sales' => $sales,
            'invoices' => $invoicesQuery->get(),
            'activityLogs' => $activityLogs,
            'settings' => Setting::getAppSettings(),
        ]);
    }
}
