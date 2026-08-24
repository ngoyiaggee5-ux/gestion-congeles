@echo off
title MBALA KWA SELEMANI - API Laravel
cd /d "%~dp0"
echo.
echo  API MBALA KWA SELEMANI
echo  ======================
php -m | findstr /i pdo_mysql >nul
if errorlevel 1 (
  echo  ERREUR : extension PHP pdo_mysql inactive.
  echo  Activez extension=pdo_mysql dans php.ini puis relancez.
  pause
  exit /b 1
)
php artisan config:clear >nul 2>&1
echo  Laissez cette fenetre OUVERTE pendant l'utilisation de l'app.
echo  URL : http://127.0.0.1:8000
echo.
php artisan serve --host=127.0.0.1 --port=8000
pause
