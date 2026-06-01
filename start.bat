@echo off
title KASIR PRO
color 0A

echo ========================================
echo    KASIR PRO - Starting Application
echo ========================================
echo.

:: KILL PORT 3000 & 5173
echo Stopping existing services...
powershell -Command "Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"
powershell -Command "Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"
timeout /t 2 /nobreak >nul

:: START BACKEND
echo Starting Backend Server...
start "KASIR PRO - BACKEND" cmd /k "cd /d C:\Users\Admin\Documents\kasir-app\backend && node src/server.js"

:: TUNGGU 3 DETIK
timeout /t 3 /nobreak >nul

:: START FRONTEND
echo Starting Frontend Server...
start "KASIR PRO - FRONTEND" cmd /k "cd /d C:\Users\Admin\Documents\kasir-app\frontend && npm run dev"

:: TUNGGU 5 DETIK
timeout /t 5 /nobreak >nul

:: BUKA BROWSER
echo Opening browser...
start http://localhost:5173

echo.
echo ========================================
echo    KASIR PRO IS RUNNING!
echo ========================================
echo.
echo    Local Access:  http://localhost:5173
echo    Login: admin / admin123
echo.
echo    Jangan tutup jendela ini!
echo    Tutup semua terminal untuk stop.
echo ========================================
pause