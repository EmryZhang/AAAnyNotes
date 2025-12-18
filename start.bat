@echo off
echo Starting AAAnyNotes all services...
echo.

REM Start Go backend in new window
echo Starting Go backend...
start "Go Backend" cmd /k "cd /d %~dp0backend\go && go run cmd/api/main.go"

REM Wait a moment
timeout /t 3 /nobreak >nul

REM Start Python backend in new window
echo Starting Python backend...
start "Python Backend" cmd /k "cd /d %~dp0backend\python && conda activate sj && python src/main.py"

REM Wait a moment
timeout /t 3 /nobreak >nul

REM Start React frontend in new window
echo Starting React frontend...
start "React Frontend" cmd /k "cd /d %~dp0frontend && pnpm dev"

echo.
echo All services are starting in separate windows:
echo - Go Backend: http://localhost:8080
echo - Python Backend: http://localhost:8000
echo - React Frontend: http://localhost:5173
echo.
echo Close the individual windows to stop each service.
pause