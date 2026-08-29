@echo off
title MBALA KWA - Creer backend.zip pour Hostinger
cd /d "%~dp0\.."
echo.
echo  Creation de backend.zip (sans fichiers inutiles)...
echo.

if exist backend.zip del /f backend.zip

cd backend
tar -a -c -f "..\backend.zip" ^
  --exclude="database/hostinger-setup.mysql.sql" ^
  --exclude="storage/logs/*.log" ^
  --exclude="storage/framework/cache/data/*" ^
  --exclude="storage/framework/sessions/*" ^
  --exclude="storage/framework/views/*.php" ^
  .

if errorlevel 1 (
  echo ERREUR lors de la creation du zip.
  pause
  exit /b 1
)

cd ..
echo.
echo  OK : %~dp0..\backend.zip
echo  Uploadez et extrayez dans public_html/api/ sur Hostinger.
echo.
pause
