@echo off
title IEEE SB RMKEC - local site
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Download the LTS version from https://nodejs.org and run this file again.
  start https://nodejs.org/en/download
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing packages - first run only, this takes a few minutes...
  call npm install
  if errorlevel 1 (
    echo npm install failed. See the messages above.
    pause
    exit /b 1
  )
)

echo.
echo Starting the site. It will open at http://localhost:3000
echo Keep this window open while you use the site. Close it to stop.
echo.
start "" cmd /c "timeout /t 12 >nul & start http://localhost:3000"
call npm run dev
pause
