@echo off
title AegisVision - Real-Time Violence Detection System
echo ==================================================================
echo   Starting AegisVision Defense Suite
echo ==================================================================
echo.
echo [1/2] Launching Python FastAPI + PyTorch Backend on Port 8000...
start "AegisVision Backend" cmd /k "python backend\start_backend.py"

echo [2/2] Launching React Tactical Dashboard on Port 5173...
start "AegisVision Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ==================================================================
echo Both servers are launching!
echo * Dashboard URL: http://localhost:5173
echo * Backend API:   http://localhost:8000
echo * Standalone 2D Arcade Game: standalone-game\index.html
echo ==================================================================
pause
