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
echo Regenerating Prisma client...
call bunx prisma generate

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

REM Convert PNG logo to a proper ICO file
powershell -NoProfile -ExecutionPolicy Bypass -Command "Add-Type -AssemblyName System.Drawing; $appDir=$env:APP_DIR; $png=Join-Path $appDir 'public\Logo_CimaKids.png'; $ico=Join-Path $appDir 'Logo_CimaKids.ico'; $bmp=New-Object System.Drawing.Bitmap($png); $r=New-Object System.Drawing.Bitmap($bmp,256,256); $ms=New-Object System.IO.MemoryStream; $r.Save($ms,[System.Drawing.Imaging.ImageFormat]::Png); $pb=$ms.ToArray(); $ms.Dispose(); $id=New-Object System.IO.MemoryStream; $w=New-Object System.IO.BinaryWriter($id); $w.Write([uint16]0); $w.Write([uint16]1); $w.Write([uint16]1); $w.Write([byte]0); $w.Write([byte]0); $w.Write([byte]0); $w.Write([byte]0); $w.Write([uint16]1); $w.Write([uint16]32); $w.Write([uint32]$pb.Length); $w.Write([uint32]22); $w.Write($pb); $w.Flush(); [System.IO.File]::WriteAllBytes($ico,$id.ToArray()); $w.Dispose(); $bmp.Dispose(); $r.Dispose()"

REM Create .lnk shortcut on the desktop pointing to START.bat with the logo icon
powershell -NoProfile -ExecutionPolicy Bypass -Command "$appDir=$env:APP_DIR; $ico=Join-Path $appDir 'Logo_CimaKids.ico'; $sh=New-Object -ComObject WScript.Shell; $lnk=$sh.CreateShortcut((Join-Path ([Environment]::GetFolderPath('Desktop')) 'Iniciar Church Check-In.lnk')); $lnk.TargetPath=Join-Path $appDir 'START.bat'; $lnk.WorkingDirectory=$appDir; $lnk.IconLocation=\"$ico,0\"; $lnk.Description='Church Check-In - Cima Iglesia'; $lnk.Save()"

echo Desktop shortcut created!

echo.
echo ================================
echo   Update complete!
echo   Use "Iniciar Church Check-In" on the desktop to start the server.
echo ================================
echo.
pause
