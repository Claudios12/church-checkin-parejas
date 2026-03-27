@echo off
title Parejas Event - Setup
cd /d "%~dp0"

echo ============================================
echo   Parejas Event - Setup
echo ============================================
echo.

:: ── Verify tools ─────────────────────────────
echo Verifying required tools...
echo.

git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [MISSING] Git is not installed. Please install it from https://git-scm.com
    pause
    exit /b 1
)
echo [OK] Git

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [MISSING] Node.js is not installed. Please install it from https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js

bun --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [MISSING] Bun is not installed. Please install it from https://bun.sh
    pause
    exit /b 1
)
echo [OK] Bun

echo.
echo All tools verified. Continuing setup...
echo.

:: ── 1. Clone repo ───────────────────────────
echo [1/4] Cloning repository...
if exist "church-checkin-parejas" (
    echo Folder already exists. Pulling latest changes...
    cd church-checkin-parejas
    git pull
) else (
    git clone https://github.com/Claudios12/church-checkin-parejas
    if %errorlevel% neq 0 (
        echo ERROR: git clone failed. Check your internet connection.
        pause
        exit /b 1
    )
    cd church-checkin-parejas
)
echo Done.
echo.

:: ── Auto-create .env if missing ──────────────
if not exist ".env" (
    echo Creating .env file from template...
    copy ".env.example" ".env" >nul
    echo .env created.
    echo.
)

:: ── 2. Install dependencies ──────────────────
echo [2/4] Installing dependencies...
call bun install
if %errorlevel% neq 0 (
    echo ERROR: bun install failed.
    pause
    exit /b 1
)
echo Done.
echo.

:: ── 3. Build the app ─────────────────────────
echo [3/4] Building the app (this may take a minute)...
call bun run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed.
    pause
    exit /b 1
)
echo Done.
echo.

:: ── 4. Desktop shortcut ──────────────────────
echo [4/4] Creating desktop shortcut...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$dir = '%CD%';" ^
  "$shell = New-Object -ComObject WScript.Shell;" ^
  "$lnk = $shell.CreateShortcut([Environment]::GetFolderPath('Desktop') + '\Parejas Event.lnk');" ^
  "$lnk.TargetPath = Join-Path $dir 'start.bat';" ^
  "$lnk.WorkingDirectory = $dir;" ^
  "$lnk.Save()"
echo Done.
echo.

echo ============================================
echo   Setup complete!
echo   A shortcut has been added to your Desktop.
echo   Double-click it to start the app.
echo ============================================
pause
