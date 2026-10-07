# MBALA KWA SELEMANI — Documentation

**Application de gestion** pour congélateur commercial : caisse, stock froid, facturation, clients, utilisateurs et rapports.

| Élément | Valeur |
|---------|--------|
| Version applicative | **1.0.0** |
| Frontend | React 19 + Vite 8 + Bootstrap 5 |
| Backend | Laravel (API REST) + Sanctum |
| Base de données | SQLite (local) / MySQL (Hostinger) |

---

## 1. Vue d’ensemble

### URLs de production

| Service | URL | Dossier Hostinger |
|---------|-----|-------------------|
| Site (frontend) | https://mbalakwa.nguwatechdrc.com | `public_html/Mbalakwa/` |
| API | https://api.nguwatechdrc.com | `public_html/api/` (docroot = `api/public`) |

### Architecture

```
Navigateur
    │
    ▼
Frontend React (Vite build → fichiers statiques)
    │  HTTPS  /api/v1/...
    ▼
Backend Laravel (Sanctum Bearer token)
    │
    ▼
MySQL (Hostinger) ou SQLite (local)
```

### Parcours utilisateur

1. **`/`** — Page d’accueil (splash ~5 s, logo + présentation)
2. **`/login`** — Connexion (e-mail + mot de passe)
3. **`/dashboard`** (ou page d’accueil selon le rôle) — Application
4. Déconnexion → retour à `/`

La session active est liée à l’onglet navigateur (`sessionStorage`) : fermer l’onglet exige une nouvelle connexion.

---

## 2. Structure du dépôt

```
VIVRE-FRAIS/
├── frontend/                 # Application React
│   ├── public/               # Logo, .htaccess
│   ├── src/
│   │   ├── components/       # Layout, Logo, WelcomeModal, etc.
│   │   ├── pages/            # Écrans métier
│   │   ├── data/             # AppContext, store local
│   │   ├── hooks/            # Live sync, alertes stock
│   │   └── utils/            # API, permissions, settings
│   ├── .env.production       # URL API pour le build Hostinger
│   └── creer-frontend-zip.bat
├── backend/                  # API Laravel
│   ├── app/Http/Controllers/Api/
│   ├── app/Support/          # Permissions, coûts, numéros docs
│   ├── database/             # Migrations + SQL Hostinger
│   ├── public/               # index.php, diagnostic.php, ping-db.php
│   ├── demarrer-api.bat      # Lancer l’API en local
│   └── creer-backend-zip.bat
├── frontend.zip              # Build prêt pour Hostinger
├── backend.zip               # API prête pour Hostinger (sans .env)
└── DOCUMENTATION.md          # Ce fichier
```

---

## 3. Fonctionnalités

### Modules

| Module | Description |
|--------|-------------|
| **Tableau de bord** | KPI (ventes du jour, CA, alertes, stock), suggestions, graphiques |
| **Produits** | Ajout, modification, catégories, prix, **coût d’achat** |
| **Stock** | Entrées, sorties, disponible, historique |
| **Ventes** | Détail / gros, panier, paiement (CDF / USD) |
| **Facturation** | Historique, impression, vérification QR ; facture auto à chaque vente |
| **Clients** | Fiche clients |
| **Utilisateurs** | Comptes par rôle + vue permissions |
| **Rapports** | Ventes, stock, **bénéfices** (sur coût réel) |
| **Paramètres** | Thème, palette, police, devise, taux USD |

### Facturation (important)

- À chaque **paiement validé**, une **facture est créée automatiquement**.
- La page **Générer facture** ne sert qu’aux cas exceptionnels (vente sans facture, ex. après suppression de facture).
- Pour imprimer : **Facturation → Historique** ou **Imprimer facture**.

### Thèmes

Palettes : Forêt, Océan, Soleil, Ardoise, Baie.  
Le thème est **unique pour le magasin** (réglage serveur synchronisé).

---

## 4. Rôles et permissions

| Rôle | Accès principal | Ne peut pas |
|------|-----------------|-------------|
| **admin** | Produits, stock, facturation, rapports, utilisateurs, paramètres | Vendre |
| **manager** | Stock, produits, clients, facturation, rapports | Vendre, gérer utilisateurs |
| **vendeur** | Caisse (détail/gros), panier, paiement, voir stock/produits, imprimer factures | Clients, rapports, paramètres, suppressions |

Page d’accueil après login :

- admin → `/dashboard`
- manager → `/rapports/ventes`
- vendeur → `/ventes/detail`

---

## 5. Installation locale

### Prérequis

- Node.js 18+
- PHP 8.2+
- Composer
- (optionnel) MySQL

### Backend

```powershell
cd d:\VIVRE-FRAIS\backend
copy .env.example .env
# Vérifier APP_KEY ; sinon : php artisan key:generate
composer install
# SQLite : créer database/database.sqlite si besoin
php artisan migrate --seed
```

Démarrer l’API :

```powershell
# ou double-clic sur demarrer-api.bat
php artisan serve
```

API locale : `http://127.0.0.1:8000`

Compte seed (local) :

| E-mail | Mot de passe | Rôle |
|--------|--------------|------|
| admin@mbala-kwa.ci | admin123 | admin |

### Frontend

```powershell
cd d:\VIVRE-FRAIS\frontend
# .env pour le proxy Vite :
# VITE_API_URL=/api/v1
npm install
npm run dev
```

App locale : `http://127.0.0.1:5173`

Le proxy Vite envoie `/api` vers `http://127.0.0.1:8000`.

---

## 6. Déploiement Hostinger

### Préparer les zips

**Frontend**

```powershell
cd d:\VIVRE-FRAIS\frontend
# Vérifier .env.production :
# VITE_API_URL=https://api.nguwatechdrc.com/api/v1
creer-frontend-zip.bat
```

→ Produit `D:\VIVRE-FRAIS\frontend.zip`

**Backend**

```powershell
cd d:\VIVRE-FRAIS\backend
creer-backend-zip.bat
```

→ Produit `D:\VIVRE-FRAIS\backend.zip` (**sans** fichier `.env`)

### Uploader

1. **Frontend** : extraire `frontend.zip` dans `public_html/Mbalakwa/`  
   (doit contenir `index.html`, `assets/`, `.htaccess`, `Logo.jpeg`, …)
2. **Backend** : extraire `backend.zip` dans `public_html/api/`  
   **Ne pas écraser** le `.env` déjà présent sur le serveur.
3. Sous-domaine API pointé vers `public_html/api/public`
4. Droits `storage/` et `bootstrap/cache/` : **775**

### Base MySQL (si nouvelle install / mises à jour)

1. Importer `backend/database/hostinger-setup.mysql.sql` si tables absentes.
2. Si coût d’achat pas encore en base : exécuter  
   `backend/database/add-cost-price.mysql.sql` dans phpMyAdmin.

### Vérifications

| Test | Attendu |
|------|---------|
| https://api.nguwatechdrc.com/api/health | `{"status":"ok",...}` |
| https://api.nguwatechdrc.com/ping-db.php | `"ok": true`, `"db_connected": true` |
| https://mbalakwa.nguwatechdrc.com | Splash → Login → App |

Après upload frontend : **Ctrl+F5** (vider le cache navigateur).

---

## 7. API (aperçu)

Préfixe : `/api/v1`  
Auth : header `Authorization: Bearer <token>` (sauf login et health)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/health` | Santé API (hors v1) |
| POST | `/login` | Connexion |
| POST | `/logout` | Déconnexion |
| GET | `/me` | Utilisateur courant |
| GET | `/app-state` | État complet de l’app |
| GET | `/sync-version` | Version sync multi-postes |
| CRUD | `/products`, `/categories`, `/clients`, `/users` | Ressources |
| POST | `/sales` | Vente + facture auto + sortie stock |
| GET/POST | `/invoices` | Factures |
| GET | `/public/invoices/verify/{number}` | Vérification publique |
| GET/PUT | `/settings` | Paramètres magasin |
| GET | `/reports/...` | Rapports |

Scripts utiles sur le serveur :

- `public/diagnostic.php` — diagnostic déploiement
- `public/ping-db.php` — test connexion DB

---

## 8. Coût d’achat et bénéfices

1. Chaque produit a un champ **`cost_price`** (coût d’achat CDF).
2. À la vente, chaque ligne enregistre **`unit_cost`**.
3. Les **rapports bénéfices** utilisent ce coût réel (pas une estimation).
4. Les **entrées de stock** peuvent mettre à jour le coût (moyenne pondérée côté backend).

Sans `cost_price` renseigné, les bénéfices restent approximatifs ou nuls.

---

## 9. Développement — commandes utiles

```powershell
# Frontend
cd frontend
npm run dev          # développement
npm run build        # production → dist/
npm run lint         # oxlint

# Backend
cd backend
php artisan serve
php artisan migrate
php artisan db:seed
php artisan route:list
```

Créer les zips Hostinger : scripts `.bat` dans `frontend/` et `backend/`.

---

## 10. Dépannage

| Problème | Piste |
|----------|-------|
| Page blanche après login | Vérifier console navigateur ; rebuild + redeploy `frontend.zip` ; Ctrl+F5 |
| Login 500 | Vérifier `.env` API, `CACHE_STORE=file`, permissions `storage/` |
| API inaccessible | `api/health`, `ping-db.php`, sous-domaine → `api/public` |
| Menu « Vente sans facture » vide | Normal si toutes les ventes ont déjà une facture |
| Thème vert qui « reste » | Palette serveur + cache ; choisir la palette dans Paramètres |
| Stock illisible dans le formulaire produit | Corrigé (colonnes Stock / Seuil rééquilibrées) — redeploy frontend |

---

## 11. État de version (référence)

À la date de rédaction de cette doc :

- **Code local** (`d:\VIVRE-FRAIS`) = dernière version de travail (splash, login, dashboard KPI, coût d’achat, sync, etc.).
- **`frontend.zip`** : build le plus récent (à régénérer après chaque modif frontend importante).
- **`backend.zip`** : peut être plus ancien que le code local ; régénérer avant un gros déploiement API.
- **Git `origin/main`** : peut **ne pas** contenir toutes les modifications locales non commitées.

Pour confirmer que Hostinger est à jour : comparer la date de `frontend.zip` déployé et tester splash → login → dashboard.

---

## 12. Contacts / comptes

- Seed local : `admin@mbala-kwa.ci` / `admin123`
- Compte production : fourni par l’administrateur du magasin (ne pas committer de mots de passe).

---

*Document généré pour le projet MBALA KWA SELEMANI (VIVRE-FRAIS).*
