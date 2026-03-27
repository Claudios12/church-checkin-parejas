@echo off
title Parejas Event - Setup
cd /d "%~dp0"

echo ============================================
echo   Parejas Event - Setup
echo ============================================
echo.

:: ── Verify tools ─────────────────────────────
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [MISSING] Git - https://git-scm.com
    pause
    exit /b 1
)
echo [OK] Git

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [MISSING] Node.js - https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js

bun --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [MISSING] Bun - https://bun.sh
    pause
    exit /b 1
)
echo [OK] Bun
echo.

:: ── Clone or update ──────────────────────────
if exist "church-checkin-parejas" (
    cd church-checkin-parejas
    git pull
) else (
    git clone https://github.com/Claudios12/church-checkin-parejas
    if %errorlevel% neq 0 (
        echo ERROR: git clone failed.
        pause
        exit /b 1
    )
    cd church-checkin-parejas
)

:: ── .env ─────────────────────────────────────
if not exist ".env" copy ".env.example" ".env" >nul

:: ── Install & build ───────────────────────────
call bun install
if %errorlevel% neq 0 ( echo ERROR: bun install failed. & pause & exit /b 1 )

call bunx nuxt prepare
if %errorlevel% neq 0 ( echo ERROR: nuxt prepare failed. & pause & exit /b 1 )

call bun run build
if %errorlevel% neq 0 ( echo ERROR: Build failed. & pause & exit /b 1 )

echo.
echo ============================================
echo   Listo! Ejecuta start.bat para iniciar.
echo ============================================
pause
