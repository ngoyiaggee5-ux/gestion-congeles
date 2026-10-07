@echo off
title MBALA KWA - API locale
cd /d "%~dp0"

echo.
echo  MBALA KWA — demarrage API locale (127.0.0.1:8000)
echo.

where php >nul 2>&1
if errorlevel 1 (
  echo ERREUR: PHP introuvable. Installez PHP 8.2+ et ajoutez-le au PATH.
  pause
  exit /b 1
)

if not exist vendor\autoload.php (
  echo  Installation des dependances Composer...
  composer install --no-interaction
  if errorlevel 1 (
    echo ERREUR: composer install a echoue.
    pause
    exit /b 1
  )
)

if not exist database\database.sqlite (
  echo  Creation base SQLite locale...
  type nul > database\database.sqlite
)

if exist .env.local (
  copy /Y .env.local .env >nul
  echo  Mode LOCAL (.env.local + SQLite)
) else (
  echo  ATTENTION: .env.local absent — utilisation de .env actuel.
)

php artisan config:clear >nul 2>&1
php artisan migrate --force --no-interaction
if errorlevel 1 (
  echo ERREUR: migrations echouees. Verifiez PHP et la base de donnees.
  pause
  exit /b 1
)

php artisan db:seed --force --no-interaction >nul 2>&1

echo.
echo  OK — API: http://127.0.0.1:8000/api/health
echo  Frontend: dans frontend/ lancez "npm run dev" (proxy /api)
echo  Arret: Ctrl+C dans cette fenetre
echo.

php artisan serve --host=127.0.0.1 --port=8000
exit /b 0
