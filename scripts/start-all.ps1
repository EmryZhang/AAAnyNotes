# AAAnyNotes One-Click Startup Script
# Start all services: Go backend, Python backend, React frontend

Write-Host "Starting AAAnyNotes all services..." -ForegroundColor Green

# Set project root directory
$rootDir = Split-Path -Parent $PSScriptRoot

# Start Go backend
Write-Host "Starting Go backend service..." -ForegroundColor Yellow
$goJob = Start-Job -ScriptBlock {
    param($rootDir)
    Set-Location "$rootDir\backend\go"
    go run cmd/api/main.go
} -ArgumentList $rootDir

# Wait a moment for Go service to start
Start-Sleep -Seconds 3

# Start Python backend
Write-Host "Starting Python backend service..." -ForegroundColor Yellow
$pythonJob = Start-Job -ScriptBlock {
    param($rootDir)
    Set-Location "$rootDir\backend\python"
    # Try to activate conda environment
    try {
        conda activate sj 2>$null
    } catch {
        Write-Host "Warning: Cannot activate conda environment 'sj', using default Python environment" -ForegroundColor Yellow
    }
    python src/main.py
} -ArgumentList $rootDir

# Wait a moment for Python service to start
Start-Sleep -Seconds 3

# Start React frontend
Write-Host "Starting React frontend service..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    param($rootDir)
    Set-Location "$rootDir\frontend"
    pnpm dev
} -ArgumentList $rootDir

Write-Host "" -ForegroundColor Green
Write-Host "All services are starting..." -ForegroundColor Green
Write-Host "Go Backend: http://localhost:8080" -ForegroundColor Cyan
Write-Host "Python Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "React Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow

try {
    # Wait for user interrupt
    while ($true) {
        Start-Sleep -Seconds 1
        
        # Check service status
        $goStatus = Receive-Job $goJob -ErrorAction SilentlyContinue
        $pythonStatus = Receive-Job $pythonJob -ErrorAction SilentlyContinue
        $frontendStatus = Receive-Job $frontendJob -ErrorAction SilentlyContinue
        
        # If any service fails, show status
        if ($goStatus -or $pythonStatus -or $frontendStatus) {
            Write-Host "Service status update:" -ForegroundColor Gray
        }
    }
}
catch {
    Write-Host "Stopping all services..." -ForegroundColor Red
}
finally {
    # Clean up all jobs
    Remove-Job $goJob -Force -ErrorAction SilentlyContinue
    Remove-Job $pythonJob -Force -ErrorAction SilentlyContinue
    Remove-Job $frontendJob -Force -ErrorAction SilentlyContinue
    Write-Host "All services stopped" -ForegroundColor Red
}