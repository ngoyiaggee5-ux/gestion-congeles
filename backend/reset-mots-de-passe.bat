@echo off
title MBALA KWA SELEMANI - Reset mots de passe demo
cd /d "%~dp0"
echo.
echo  Reset des comptes demo dans MySQL
echo  ==================================
php database\reset-demo-passwords.php
echo.
pause
