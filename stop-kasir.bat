@echo off
title STOP KASIR PRO
color 0C

echo ========================================
echo    Stopping KASIR PRO Services
echo ========================================
echo.

echo Stopping servers on port 3000 and 5173...
powershell -Command "Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"
powershell -Command "Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"

echo.
echo ========================================
echo    All services stopped!
echo ========================================
timeout /t 2 /nobreak >nul
exit