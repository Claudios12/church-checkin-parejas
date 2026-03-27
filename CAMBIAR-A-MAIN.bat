@echo off
title Parejas Event - Cambiar a main
cd /d "%~dp0"

echo ============================================
echo   Parejas Event - Cambiar a rama main
echo ============================================
echo.

echo Cambiando a rama main...
git checkout main
if errorlevel 1 (
    echo ERROR: No se pudo cambiar a main.
    pause
    exit /b 1
)

echo Descargando ultimos cambios...
git pull
if errorlevel 1 (
    echo ERROR: No se pudo descargar los cambios.
    pause
    exit /b 1
)

echo Instalando dependencias...
call bun install

echo.
echo ============================================
echo   Listo. Ejecuta start.bat para iniciar.
echo ============================================
pause
