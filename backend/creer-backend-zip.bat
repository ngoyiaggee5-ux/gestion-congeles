@echo off
title MBALA KWA - Creer backend.zip pour Hostinger
cd /d "%~dp0\.."
echo.
echo  Creation de backend.zip (avec vendor, ~36 Mo compresse)...
echo.

if exist backend.zip del /f backend.zip

cd backend
tar -a -c -f "..\backend.zip" ^
  --exclude=".env" ^
  --exclude=".env.local" ^
  --exclude=".env.hostinger.bak" ^
  --exclude="database/database.sqlite" ^
  --exclude="database/hostinger-setup.mysql.sql" ^
  --exclude="storage/logs" ^
  --exclude="storage/framework/cache/data" ^
  --exclude="storage/framework/sessions" ^
  --exclude="storage/framework/views" ^
  .

if errorlevel 1 (
  echo ERREUR lors de la creation du zip.
  cd ..
  pause
  exit /b 1
)

cd ..
for %%A in (backend.zip) do set SIZE=%%~zA
echo.
echo  OK : %~dp0backend.zip
echo  Taille compressee : environ %%~zA octets
echo  Uploadez et extrayez dans public_html/api/ sur Hostinger.
echo  NE remplacez PAS le .env deja sur le serveur.
echo.
pause
