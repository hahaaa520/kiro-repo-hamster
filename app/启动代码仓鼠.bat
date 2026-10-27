@echo off
chcp 65001 >nul
cd /d %~dp0
echo.
echo   🐹 正在启动代码仓鼠...
echo.
node server.mjs
if errorlevel 1 (
  echo.
  echo   启动失败：请先安装 Node.js（https://nodejs.org）
  pause
)
