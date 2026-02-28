@echo off
title Church Check-In Update
cd /d "%~dp0"

echo ================================
echo   Church Check-In Update
echo ================================
echo.

echo Downloading latest changes...
git pull
if errorlevel 1 (
    echo ERROR: Update failed. Check your internet connection.
    pause
    exit /b 1
)

echo.
echo Installing any new dependencies...
call bun install

echo.
echo Applying any database changes...
set DATABASE_URL=file:%~dp0dev.db
call bunx prisma migrate deploy

echo.
echo Rebuilding app...
call bun run build
if errorlevel 1 (
    echo ERROR: Build failed.
    pause
    exit /b 1
)

echo.
echo ================================
echo   Update complete!
echo   Run START.bat to start the server.
echo ================================
echo.
pause
