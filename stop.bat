@echo off
echo 正在终止所有相关进程...
taskkill /f /im node.exe
taskkill /f /im python.exe
echo 所有服务已停止。
pause