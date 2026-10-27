@echo off
chcp 65001 >nul
cd /d "%~dp0..\app"
echo.
echo   🐹 正在启动代码仓鼠...
echo   （浏览器会自动打开；关掉这个窗口即停止服务）
echo.
start "" "http://localhost:5173/?demo=champion&noloading=1"
node server.mjs
pause
