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
echo Creating desktop shortcut...
set APP_DIR=%USERPROFILE%\church-checkin

REM Convert PNG logo to ICO
powershell -NoProfile -ExecutionPolicy Bypass -Command "Add-Type -AssemblyName System.Drawing; $appDir = $env:APP_DIR; $png = Join-Path $appDir 'public\Logo_CimaKids.png'; $ico = Join-Path $appDir 'Logo_CimaKids.ico'; $bmp = New-Object System.Drawing.Bitmap($png); $icon = [System.Drawing.Icon]::FromHandle($bmp.GetHicon()); $stream = [System.IO.FileStream]::new($ico, [System.IO.FileMode]::Create); $icon.Save($stream); $stream.Close(); $bmp.Dispose(); $icon.Dispose()"

REM Create .lnk shortcut on the desktop pointing to START.bat with the logo icon
powershell -NoProfile -ExecutionPolicy Bypass -Command "$appDir = $env:APP_DIR; $ico = Join-Path $appDir 'Logo_CimaKids.ico'; $sh = New-Object -ComObject WScript.Shell; $lnk = $sh.CreateShortcut((Join-Path ([Environment]::GetFolderPath('Desktop')) 'Iniciar Church Check-In.lnk')); $lnk.TargetPath = Join-Path $appDir 'START.bat'; $lnk.WorkingDirectory = $appDir; $lnk.IconLocation = $ico; $lnk.Description = 'Church Check-In - Cima Iglesia'; $lnk.Save()"

echo Desktop shortcut created!

echo.
echo ================================
echo   Update complete!
echo   Use "Iniciar Church Check-In" on the desktop to start the server.
echo ================================
echo.
pause
