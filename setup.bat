@echo off
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
echo [1/3] Cloning repository...
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

:: ── 2. Install dependencies ──────────────────
echo [2/3] Installing dependencies...
call bun install
if %errorlevel% neq 0 (
    echo ERROR: bun install failed.
    pause
    exit /b 1
)
echo Done.
echo.

:: ── 3. Desktop shortcut with icon ────────────
echo [3/3] Creating desktop shortcut...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Add-Type -AssemblyName System.Drawing;" ^
  "$dir = '%CD%';" ^
  "$pngPath = Join-Path $dir 'public\Logo_LibresParaAmar.png';" ^
  "$icoPath = Join-Path $dir 'public\Logo_LibresParaAmar.ico';" ^
  "$png = [System.Drawing.Image]::FromFile($pngPath);" ^
  "$bmp = New-Object System.Drawing.Bitmap($png);" ^
  "$hicon = $bmp.GetHicon();" ^
  "$icon = [System.Drawing.Icon]::FromHandle($hicon);" ^
  "$stream = [System.IO.File]::OpenWrite($icoPath);" ^
  "$icon.Save($stream); $stream.Close(); $icon.Dispose(); $bmp.Dispose(); $png.Dispose();" ^
  "$shell = New-Object -ComObject WScript.Shell;" ^
  "$lnk = $shell.CreateShortcut([Environment]::GetFolderPath('Desktop') + '\Parejas Event.lnk');" ^
  "$lnk.TargetPath = Join-Path $dir 'start.bat';" ^
  "$lnk.IconLocation = $icoPath;" ^
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
