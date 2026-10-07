# MBALA KWA SELEMANI

Gestion congélateur commercial — caisse, stock froid, facturation et rapports.

## Documentation complète

→ Voir **[DOCUMENTATION.md](./DOCUMENTATION.md)**  
(architecture, installation locale, déploiement Hostinger, rôles, API, dépannage)

## Démarrage rapide (local)

```powershell
# API
cd backend
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
# ou : demarrer-api.bat

# Frontend (autre terminal)
cd frontend
npm install
npm run dev
```

- App : http://127.0.0.1:5173  
- API : http://127.0.0.1:8000  
- Compte démo : `admin@mbala-kwa.ci` / `admin123`

## Production

| | |
|--|--|
| Site | https://mbalakwa.nguwatechdrc.com |
| API | https://api.nguwatechdrc.com |

Zips : `frontend/creer-frontend-zip.bat` et `backend/creer-backend-zip.bat`

## Stack

- **Frontend** : React 19, Vite 8, Bootstrap 5, Recharts  
- **Backend** : Laravel API, Sanctum  
- **DB** : SQLite (dev) / MySQL (Hostinger)
