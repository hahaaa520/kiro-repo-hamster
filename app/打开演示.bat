@echo off
chcp 65001 >nul
cd /d "%~dp0"
start "" "%~dp0index.html?demo=champion&noloading=1"
