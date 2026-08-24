@echo off
title MBALA KWA SELEMANI - Corriger colonnes MySQL
cd /d "%~dp0"
echo.
echo  Correction des colonnes NAME/PASSWORD/TYPE/STATUS...
echo  ====================================================
php database\fix-column-case.php
echo.
php database\reset-demo-passwords.php
echo.
pause
