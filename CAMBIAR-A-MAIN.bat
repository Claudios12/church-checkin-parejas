@echo off
title Cambiar a version anterior (main)
cd /d "%~dp0"

echo Cambiando a la version anterior (main)...
git checkout main
if errorlevel 1 (
    echo ERROR: No se pudo cambiar de rama.
    pause
    exit /b 1
)

echo.
echo Reconstruyendo aplicacion...
call UPDATE.bat
