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
| GET/POST | `/api/v1/invoices` | Factures |
| GET/POST | `/api/v1/stock-movements` | Mouvements stock |
| GET/PUT | `/api/v1/settings` | Paramètres app |

## Comptes de démo

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| admin@mbala-kwa.ci | admin123 | administrateur |
| marie@mbala-kwa.ci | vendeur123 | vendeur |
| jean@mbala-kwa.ci | caissier123 | caissier |

## Note

Le frontend React utilise actuellement le **localStorage** (mode démo).
Pour connecter le frontend à cette API, configurez `VITE_API_URL=http://127.0.0.1:8000/api/v1` dans `frontend/.env`.
