@echo off
title Cambiar de Rama
cd /d "%~dp0"

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
    echo.
    echo ERROR: No se pudo cambiar a la rama "%RAMA%".
    pause
    exit /b 1
)

echo.
echo Rama cambiada a: %RAMA%
echo Reconstruyendo aplicacion...
call UPDATE.bat
