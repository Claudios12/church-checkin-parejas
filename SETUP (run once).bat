@echo off
title Church Check-In Setup
cd /d "%~dp0"

echo ================================
echo   Church Check-In First Setup
echo ================================
echo.

REM Check if Bun is installed
where bun >nul 2>&1
if errorlevel 1 (
    echo ERROR: Bun is not installed!
    echo.
    echo Please install it:
    echo  1. Open a browser
    echo  2. Go to: https://bun.sh
    echo  3. Click "Install" and follow the steps
    echo  4. Restart this computer
    echo  5. Run this setup again
    echo.
    pause
    exit /b 1
)

REM Auto-create .env from example if missing
if not exist ".env" (
    echo Creating .env file from template...
    copy ".env.example" ".env" >nul
    echo .env created with default settings.
    echo.
)

REM Set DATABASE_URL explicitly with absolute path
set DATABASE_URL=file:%~dp0dev.db

echo [1/4] Installing dependencies...
call bun install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies.
    pause
    exit /b 1
)

echo.
echo [2/4] Setting up database at: %~dp0dev.db
call bunx prisma migrate deploy
if errorlevel 1 (
    echo Migration failed, trying db push as fallback...
    call bunx prisma db push --accept-data-loss
    if errorlevel 1 (
        echo ERROR: Could not set up database.
        pause
        exit /b 1
    )
)

REM Verify the database file was actually created
if not exist "dev.db" (
    echo ERROR: Database file was not created at %~dp0dev.db
    echo Something went wrong with the database setup.
    pause
    exit /b 1
)
echo Database created successfully.

echo.
echo [3/4] Generating Prisma client...
call bunx prisma generate

echo.
echo [4/4] Building the app (this takes a minute)...
call bun run build
if errorlevel 1 (
    echo ERROR: Build failed.
    pause
    exit /b 1
)

echo.
echo ================================
echo   Setup complete!
echo   Run START.bat to start the server.
echo ================================
echo.
pause
