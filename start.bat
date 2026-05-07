@echo off
title Amadeus System Launcher
echo [1/3] 正在启动 Node.js 后端服务...
:: 进入 service 目录并在后台启动 npm 服务
start "Node-Service" cmd /c "cd /d service && pnpm dev"

echo [2/3] 正在启动 WebRTC Python 大脑...
:: 进入 webrtc 目录，激活虚拟环境并运行 server.py
:: 注意：这里我们直接用 venv 里的 python，无需手动 activate
start "WebRTC-Core" cmd /c "cd /d service\webrtc && venv\Scripts\python.exe server.py"

echo [3/3] 正在启动前端界面...
:: 等待几秒钟让后台服务先就绪
timeout /t 5
start "Frontend" cmd /c "npm run dev"

echo ----------------------------------------------------
echo 系统已启动！
echo 1. Node.js 后端已开启
echo 2. Python 大脑正在运行 (如需调试请看WebRTC窗口)
echo 3. 前端已启动，请等待几秒后在浏览器打开 http://localhost:1002
echo ----------------------------------------------------
pause