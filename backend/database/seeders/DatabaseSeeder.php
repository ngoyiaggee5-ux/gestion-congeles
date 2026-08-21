<?php

use App\Models\Category;
use App\Models\Client;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Invoice;
use App\Models\StockMovement;
use App\Models\User;
use App\Models\Setting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::insert([
            [
                'name' => 'Admin Principal',
                'email' => 'admin@mbala-kwa.ci',
                'password' => Hash::make('admin123'),
                'role' => 'administrateur',
                'active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Marie Vendeur',
                'email' => 'marie@mbala-kwa.ci',
                'password' => Hash::make('vendeur123'),
                'role' => 'vendeur',
                'active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Jean Caissier',
                'email' => 'jean@mbala-kwa.ci',
                'password' => Hash::make('caissier123'),
                'role' => 'caissier',
                'active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        $categories = [
            ['name' => 'Viandes', 'description' => 'Bœuf, poulet, agneau congelés'],
            ['name' => 'Poissons', 'description' => 'Poissons et fruits de mer'],
            ['name' => 'Légumes', 'description' => 'Légumes surgelés'],
            ['name' => 'Plats préparés', 'description' => 'Repas prêts à cuire'],
        ];

        foreach ($categories as $cat) {
            Category::create($cat);
        }

        Product::insert([
            [
                'category_id' => 1, 'name' => 'Poulet entier', 'sku' => 'VI-001', 'unit' => 'kg',
                'price_retail' => 2800, 'price_wholesale' => 2400, 'stock' => 120, 'min_stock' => 20,
                'description' => 'Poulet fermier congelé', 'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'category_id' => 2, 'name' => 'Filet de tilapia', 'sku' => 'PO-014', 'unit' => 'kg',
                'price_retail' => 3500, 'price_wholesale' => 3000, 'stock' => 45, 'min_stock' => 15,
                'description' => 'Filets sans arêtes', 'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'category_id' => 3, 'name' => 'Haricots verts', 'sku' => 'LE-008', 'unit' => 'sac 1kg',
                'price_retail' => 1200, 'price_wholesale' => 950, 'stock' => 8, 'min_stock' => 25,
                'description' => 'Portion familiale', 'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'category_id' => 4, 'name' => 'Pizza 4 fromages', 'sku' => 'PL-003', 'unit' => 'pièce',
                'price_retail' => 2500, 'price_wholesale' => 2100, 'stock' => 60, 'min_stock' => 10,
                'description' => '30 cm', 'created_at' => now(), 'updated_at' => now(),
            ],
        ]);

        Client::insert([
            [
                'name' => 'Marché Central SARL', 'phone' => '+225 07 00 11 22 33',
                'email' => 'contact@marchecentral.ci', 'type' => 'gros', 'address' => 'Abidjan, Treichville',
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'name' => 'Aya Kouassi', 'phone' => '+225 05 44 55 66 77',
                'email' => 'aya.k@email.com', 'type' => 'détail', 'address' => 'Cocody Angré',
                'created_at' => now(), 'updated_at' => now(),
            ],
        ]);

        Setting::saveAppSettings([
            'font' => 'dm-sans',
            'theme' => 'light',
            'currency' => 'CDF',
            'usdRate' => 2800,
        ]);

        $sale = Sale::create([
            'number' => 'VT-2026-0001',
            'type' => 'détail',
            'client_id' => 2,
            'client_name' => 'Aya Kouassi',
            'payment_method' => 'espèces',
            'status' => 'payée',
            'total' => 5600,
            'user_id' => 2,
        ]);

        SaleItem::create([
            'sale_id' => $sale->id,
            'product_id' => 1,
            'quantity' => 2,
            'unit_price' => 2800,
        ]);

        Invoice::create([
            'number' => 'FA-2026-0001',
            'sale_id' => $sale->id,
            'client_id' => 2,
            'client_name' => 'Aya Kouassi',
            'total' => 5600,
            'status' => 'émise',
        ]);

        StockMovement::create([
            'product_id' => 1,
            'type' => 'entrée',
            'quantity' => 50,
            'unit_cost' => 2000,
            'reference' => 'BE-2026-001',
            'note' => 'Réapprovisionnement',
        ]);
    }
}
