@echo off
title MBALA KWA - Creer frontend.zip pour Hostinger
cd /d "%~dp0"

echo.
echo  1/3 - Verification .env.production...
if not exist .env.production (
  echo FICHIER MANQUANT : frontend\.env.production
  echo Creez-le avec : VITE_API_URL=https://api.nguwatechdrc.com/api/v1
  pause
  exit /b 1
)

echo  2/3 - Build production (npm run build)...
call npm run build
if errorlevel 1 (
  echo ERREUR build frontend.
  pause
  exit /b 1
)

echo  3/3 - Creation frontend.zip...
if exist "..\frontend.zip" del /f "..\frontend.zip"

cd dist
tar -a -c -f "..\..\frontend.zip" .
cd ..

echo.
echo  OK : %~dp0..\frontend.zip
echo  Uploadez et extrayez dans public_html/ sur Hostinger.
echo  Le fichier .htaccess est inclus pour React Router.
echo.
pause
