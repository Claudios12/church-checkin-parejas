@echo off
title Church Check-In - Cima Iglesia
cd /d "%~dp0"

echo ================================
echo    Church Check-In System
echo    Cima Iglesia
echo ================================
echo.

if not exist ".output" (
    echo App not built yet. Building now, please wait...
    echo.
    call bun run build
    if errorlevel 1 (
        echo.
        echo ERROR: Build failed. Run "SETUP (run once).bat" first.
        pause
        exit /b 1
    )
    echo.
    echo Build complete!
    echo.
)

REM Set database path explicitly using absolute path to avoid any ambiguity
set DATABASE_URL=file:%~dp0dev.db
set NITRO_HOST=0.0.0.0
set NITRO_PORT=3000

echo Server starting...
echo.
echo  Access from this tablet:  http://localhost:3000
echo  Access from other devices: http://%COMPUTERNAME%:3000
echo.
echo Press Ctrl+C to stop the server.
echo ================================
echo.

start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000"

bun run preview

pause
