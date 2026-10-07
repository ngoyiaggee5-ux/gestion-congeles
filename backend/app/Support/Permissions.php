<?php

namespace App\Support;

class Permissions
{
    public const DASHBOARD = 'dashboard';

    public const PRODUCTS_MANAGE = 'products.manage';

    public const PRODUCTS_VIEW = 'products.view';

    public const PRODUCTS_DELETE = 'products.delete';

    public const STOCK_MANAGE = 'stock.manage';

    public const STOCK_VIEW = 'stock.view';

    public const SALES_DETAIL = 'sales.detail';

    public const SALES_GROS = 'sales.gros';

    public const SALES_CART = 'sales.cart';

    public const SALES_PAYMENT = 'sales.payment';

    public const SALES_DELETE = 'sales.delete';

    public const BILLING_GENERATE = 'billing.generate';

    public const BILLING_PRINT = 'billing.print';

    public const BILLING_HISTORY = 'billing.history';

    public const BILLING_DELETE = 'billing.delete';

    public const CLIENTS_MANAGE = 'clients.manage';

    public const CLIENTS_DELETE = 'clients.delete';

    public const CATEGORIES_DELETE = 'categories.delete';

    public const USERS_MANAGE = 'users.manage';

    public const USERS_DELETE = 'users.delete';

    public const SETTINGS_MANAGE = 'settings.manage';

    public const REPORTS_SALES = 'reports.sales';

    public const REPORTS_STOCK = 'reports.stock';

    public const REPORTS_PROFIT = 'reports.profit';

    public const CART_CLEAR = 'cart.clear';

    private const ALL = [
        self::DASHBOARD,
        self::PRODUCTS_MANAGE,
        self::PRODUCTS_VIEW,
        self::PRODUCTS_DELETE,
        self::STOCK_MANAGE,
        self::STOCK_VIEW,
        self::SALES_DETAIL,
        self::SALES_GROS,
        self::SALES_CART,
        self::SALES_PAYMENT,
        self::SALES_DELETE,
        self::BILLING_GENERATE,
        self::BILLING_PRINT,
        self::BILLING_HISTORY,
        self::BILLING_DELETE,
        self::CLIENTS_MANAGE,
        self::CLIENTS_DELETE,
        self::CATEGORIES_DELETE,
        self::USERS_MANAGE,
        self::USERS_DELETE,
        self::SETTINGS_MANAGE,
        self::REPORTS_SALES,
        self::REPORTS_STOCK,
        self::REPORTS_PROFIT,
        self::CART_CLEAR,
    ];

    /** Admin : tout sauf ventes / caisse. */
    private const ADMIN = [
        self::DASHBOARD,
        self::PRODUCTS_MANAGE,
        self::PRODUCTS_VIEW,
        self::PRODUCTS_DELETE,
        self::STOCK_MANAGE,
        self::STOCK_VIEW,
        self::BILLING_GENERATE,
        self::BILLING_PRINT,
        self::BILLING_HISTORY,
        self::BILLING_DELETE,
        self::CLIENTS_MANAGE,
        self::CLIENTS_DELETE,
        self::CATEGORIES_DELETE,
        self::USERS_MANAGE,
        self::USERS_DELETE,
        self::SETTINGS_MANAGE,
        self::REPORTS_SALES,
        self::REPORTS_STOCK,
        self::REPORTS_PROFIT,
    ];

    private const LEGACY_ROLE_MAP = [
        'administrateur' => 'admin',
        'caissier' => 'manager',
    ];

    private const ROLE_PERMISSIONS = [
        'admin' => self::ADMIN,
        'manager' => [
            self::DASHBOARD,
            self::PRODUCTS_VIEW,
            self::PRODUCTS_MANAGE,
            self::STOCK_MANAGE,
            self::STOCK_VIEW,
            self::BILLING_GENERATE,
            self::BILLING_PRINT,
            self::BILLING_HISTORY,
            self::CLIENTS_MANAGE,
            self::REPORTS_SALES,
            self::REPORTS_STOCK,
            self::REPORTS_PROFIT,
        ],
        'vendeur' => [
            self::DASHBOARD,
            self::PRODUCTS_VIEW,
            self::STOCK_VIEW,
            self::SALES_DETAIL,
            self::SALES_GROS,
            self::SALES_CART,
            self::SALES_PAYMENT,
            self::BILLING_HISTORY,
            self::BILLING_PRINT,
            self::CART_CLEAR,
        ],
    ];

    public static function normalizeRole(?string $role): ?string
    {
        if (! $role) {
            return null;
        }

        return self::LEGACY_ROLE_MAP[$role] ?? $role;
    }

    public static function can(?string $role, string $permission): bool
    {
        $role = self::normalizeRole($role);
        if (! $role) {
            return false;
        }

        return in_array($permission, self::ROLE_PERMISSIONS[$role] ?? [], true);
    }

    /** @return list<string> */
    public static function forRole(string $role): array
    {
        $role = self::normalizeRole($role) ?? $role;

        return self::ROLE_PERMISSIONS[$role] ?? [];
    }
}
