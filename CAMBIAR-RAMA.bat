@echo off
title Parejas Event - Cambiar de Rama
cd /d "%~dp0"

echo ============================================
echo   Parejas Event - Cambiar de Rama
echo ============================================
echo.

echo Obteniendo ramas disponibles...
git fetch --all

echo.
echo ============================================
echo  RAMAS DISPONIBLES:
echo ============================================
git branch -a
echo ============================================
echo.
set /p RAMA="Escribe el nombre de la rama: "

if "%RAMA%"=="" (
    echo No escribiste ninguna rama. Cancelando.
    pause
    exit /b 1
)

git checkout %RAMA%
if errorlevel 1 (
    echo ERROR: No se pudo cambiar a la rama "%RAMA%".
    pause
    exit /b 1
)

echo Descargando ultimos cambios...
git pull

echo Instalando dependencias...
call bun install

echo.
echo ============================================
echo   Rama cambiada a: %RAMA%
echo   Ejecuta start.bat para iniciar.
echo ============================================
pause
