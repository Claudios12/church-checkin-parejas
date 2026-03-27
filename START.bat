@echo off
title Parejas Event - Un Ascenso con Proposito
cd /d "%~dp0"

echo ============================================
echo   Un Ascenso con Proposito - Parejas Event
echo ============================================
echo.

if not exist ".output" (
    echo Building app for the first time, please wait...
    echo.
    call bun run build
    if errorlevel 1 (
        echo ERROR: Build failed. Run setup.bat first.
        pause
        exit /b 1
    )
    echo Build complete!
    echo.
)

set NITRO_HOST=0.0.0.0
set NITRO_PORT=3000

echo App starting...
echo.
echo   Access from this device:   http://localhost:3000
echo   Access from other devices: http://%COMPUTERNAME%:3000
echo.
echo Press Ctrl+C to stop.
echo ============================================
echo.

start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000"

bun run preview

pause
