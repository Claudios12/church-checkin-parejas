@echo off
echo ============================================
echo   Parejas Event - Setup Automatico
echo ============================================
echo.

:: ── 1. Git ──────────────────────────────────
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [1/5] Installing Git...
    winget install --id Git.Git -e --source winget --silent
    if %errorlevel% neq 0 (
        echo ERROR: Could not install Git. Make sure winget is available.
        pause
        exit /b 1
    )
    set "PATH=%PATH%;C:\Program Files\Git\cmd"
    echo Done.
) else (
    echo [1/5] Git already installed. Skipping.
)
echo.

:: ── 2. Node.js ──────────────────────────────
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [2/5] Installing Node.js...
    winget install --id OpenJS.NodeJS.LTS -e --source winget --silent
    if %errorlevel% neq 0 (
        echo ERROR: Could not install Node.js.
        pause
        exit /b 1
    )
    set "PATH=%PATH%;C:\Program Files\nodejs"
    echo Done.
) else (
    echo [2/5] Node.js already installed. Skipping.
)
echo.

:: ── 3. Bun ──────────────────────────────────
bun --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [3/5] Installing Bun...
    winget install --id Oven-sh.Bun -e --source winget --silent
    if %errorlevel% neq 0 (
        echo ERROR: Could not install Bun.
        pause
        exit /b 1
    )
    set "PATH=%PATH%;%USERPROFILE%\.bun\bin"
    echo Done.
) else (
    echo [3/5] Bun already installed. Skipping.
)
echo.

:: ── 4. Clone repo ───────────────────────────
echo [4/5] Cloning repository...
git clone https://github.com/Claudios12/church-checkin-parejas
if %errorlevel% neq 0 (
    echo ERROR: git clone failed. Check your internet connection.
    pause
    exit /b 1
)
cd church-checkin-parejas
echo Done.
echo.

:: ── 5. Install dependencies ──────────────────
echo [5/6] Installing dependencies...
call bun install
if %errorlevel% neq 0 (
    echo ERROR: bun install failed.
    pause
    exit /b 1
)
echo Done.
echo.

:: ── 6. Desktop shortcut with icon ────────────
echo [6/6] Creating desktop shortcut...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Add-Type -AssemblyName System.Drawing;" ^
  "$png = [System.Drawing.Image]::FromFile((Resolve-Path 'public\Logo_LibresParaAmar.png'));" ^
  "$bmp = New-Object System.Drawing.Bitmap($png);" ^
  "$hicon = $bmp.GetHicon();" ^
  "$icon = [System.Drawing.Icon]::FromHandle($hicon);" ^
  "$stream = [System.IO.File]::OpenWrite((Join-Path $PWD 'public\Logo_LibresParaAmar.ico'));" ^
  "$icon.Save($stream); $stream.Close(); $icon.Dispose(); $bmp.Dispose(); $png.Dispose();" ^
  "$shell = New-Object -ComObject WScript.Shell;" ^
  "$lnk = $shell.CreateShortcut([Environment]::GetFolderPath('Desktop') + '\Parejas Event.lnk');" ^
  "$lnk.TargetPath = (Join-Path $PWD 'start.bat');" ^
  "$lnk.IconLocation = (Join-Path $PWD 'public\Logo_LibresParaAmar.ico');" ^
  "$lnk.WorkingDirectory = $PWD;" ^
  "$lnk.Save()"
echo Done.
echo.

echo ============================================
echo   Setup complete!
echo   A shortcut has been added to your Desktop.
echo   Double-click it to start the app.
echo ============================================
pause
