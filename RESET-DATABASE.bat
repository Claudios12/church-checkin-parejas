@echo off
title Resetear Base de Datos
cd /d "%~dp0"

echo ================================
echo   RESET DE BASE DE DATOS
echo ================================
echo.
echo ADVERTENCIA: Esto borrara TODOS los registros.
echo.
set /p confirm=Escribe SI para continuar:

if /i not "%confirm%"=="SI" (
    echo Cancelado.
    pause
    exit /b 0
)

echo.
echo Borrando base de datos...
if exist dev.db del dev.db

echo Recreando base de datos...
set DATABASE_URL=file:%~dp0dev.db
call bunx prisma migrate deploy

echo.
echo ================================
echo   Listo! Base de datos limpia.
echo ================================
echo.
pause
