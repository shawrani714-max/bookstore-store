@echo off
echo 📋 Viewing Server Logs...
echo.
cd /d "%~dp0"
node view-logs.js
echo.
echo Press any key to close...
pause > nul
