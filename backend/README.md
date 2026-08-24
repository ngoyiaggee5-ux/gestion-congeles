# Backend Laravel — MBALA KWA SELEMANI

API REST pour la gestion de congelé.

## Prérequis

- PHP 8.2+
- Composer
- Extension PHP : `pdo_sqlite` ou MySQL

## Installation

```bash
cd backend
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

L’API sera disponible sur **http://127.0.0.1:8000**

## Permissions par rôle

L’API applique les mêmes droits que le frontend via le middleware `role` :

| Rôle | Accès |
|------|--------|
| **Administrateur** | Contrôle total (CRUD, rapports, paramètres, utilisateurs, suppressions) |
| **Vendeur** | Vendre, consulter stock/produits, gérer clients — **pas** de rapports, paramètres, utilisateurs ni suppressions |
| **Caissier** | Panier, paiement, facturation, clients — **pas** ventes détail/gros, rapports ni admin |

Les réponses **403** indiquent une action interdite pour le rôle connecté.

## Endpoints principaux

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/api/health` | Santé API |
| POST | `/api/v1/login` | Connexion |
| GET | `/api/v1/dashboard` | Tableau de bord |
| CRUD | `/api/v1/products` | Produits |
| CRUD | `/api/v1/categories` | Catégories |
| CRUD | `/api/v1/clients` | Clients |
| GET/POST | `/api/v1/sales` | Ventes |
| DELETE | `/api/v1/sales/{id}` | Supprimer une vente (admin) |
| GET/POST | `/api/v1/invoices` | Factures |
| DELETE | `/api/v1/invoices/{id}` | Supprimer une facture (admin) |
| GET | `/api/v1/reports/*` | Rapports (admin) |
| GET/POST | `/api/v1/stock-movements` | Mouvements stock |
| GET/PUT | `/api/v1/settings` | Paramètres app |

## Comptes de démo

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| admin@mbala-kwa.ci | admin123 | admin (ADM) |
| marie@mbala-kwa.ci | vendeur123 | vendeur |
| manager@mbala-kwa.ci | manager123 | manager |

## Note

Le frontend React utilise actuellement le **localStorage** (mode démo).
Pour connecter le frontend à cette API, configurez `VITE_API_URL=http://127.0.0.1:8000/api/v1` dans `frontend/.env`.
