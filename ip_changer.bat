@echo off
chcp 65001 >nul 2>&1
set "SCRIPT=%~dp0ip_changer.ps1"
powershell -NoProfile -ExecutionPolicy Bypass -Command "& '%SCRIPT%'"
pause
