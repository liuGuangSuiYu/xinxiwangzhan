@echo off

REM 启动药品信息系统 - 一键启动脚本
REM 运行此脚本以启动后端和前端服务

echo =======================================
echo 启动药品信息系统
echo =======================================
echo 测试时间: %date% %time%
echo.

REM 检查Node.js是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: 未安装Node.js，请先安装Node.js
    pause
    exit /b 1
)

echo 1. 启动后端服务 (端口5000)...
start "药品系统-后端" cmd /k "cd /d "%~dp0" && npm start"

REM 等待后端服务启动
ping 127.0.0.1 -n 3 >nul

echo 2. 启动前端服务 (端口3000)...
start "药品系统-前端" cmd /k "cd /d "%~dp0\frontend" && npm run dev"

REM 等待前端服务启动
ping 127.0.0.1 -n 3 >nul

echo.
echo =======================================
echo 系统启动完成！
echo 前端访问地址: http://localhost:3000/
echo 后端API地址: http://localhost:5000/
echo =======================================
echo 注意：关闭时请手动关闭两个终端窗口
echo.
echo 按任意键退出...
pause >nul
