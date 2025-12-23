# Start both backends with shared environment variables
# This script loads the global environment and starts both services

param(
    [switch]$NoDebug,
    [switch]$Parallel
)

Write-Host "Starting AAAnyNotes Backends with Global Configuration..." -ForegroundColor Green

# Load environment variables from shared .env file
. (Join-Path $PSScriptRoot "load-env.ps1")

if (-not $?) {
    Write-Error "Failed to load environment variables. Exiting."
    exit 1
}

# Set up paths
$projectRoot = (Split-Path $PSScriptRoot -Parent)
$goBackend = Join-Path $projectRoot "backend\go"
$pythonBackend = Join-Path $projectRoot "backend\python"

Write-Host "Project Root: $projectRoot" -ForegroundColor Yellow
Write-Host "Go Backend: $goBackend" -ForegroundColor Yellow
Write-Host "Python Backend: $pythonBackend" -ForegroundColor Yellow

# Function to start Go backend
function Start-GoBackend {
    Write-Host "Starting Go Backend..." -ForegroundColor Cyan
    Set-Location $goBackend
    
    $env:GO_ENV_LOADED = "true"
    
    if ($NoDebug) {
        go run cmd/api/main.go
    } else {
        # Start with debug mode
        $env:DEBUG = "true"
        go run cmd/api/main.go
    }
}

# Function to start Python backend
function Start-PythonBackend {
    Write-Host "Starting Python Backend..." -ForegroundColor Cyan
    Set-Location $pythonBackend
    
    $env:PYTHON_ENV_LOADED = "true"
    
    if ($NoDebug) {
        python src/main.py
    } else {
        # Start with debug mode
        $env:DEBUG = "true"
        python src/main.py
    }
}

# Start services
if ($Parallel) {
    Write-Host "Starting both backends in parallel..." -ForegroundColor Green
    
    # Start Go backend in background job
    $goJob = Start-Job -ScriptBlock {
        param($goPath, $noDebug)
        Set-Location $goPath
        if ($noDebug) {
            go run cmd/api/main.go
        } else {
            $env:DEBUG = "true"
            go run cmd/api/main.go
        }
    } -ArgumentList $goBackend, $NoDebug
    
    # Start Python backend in background job
    $pythonJob = Start-Job -ScriptBlock {
        param($pythonPath, $noDebug)
        Set-Location $pythonPath
        if ($noDebug) {
            python src/main.py
        } else {
            $env:DEBUG = "true"
            python src/main.py
        }
    } -ArgumentList $pythonBackend, $NoDebug
    
    Write-Host "Services started in background jobs:" -ForegroundColor Green
    Write-Host "  Go Backend Job ID: $($goJob.Id)" -ForegroundColor White
    Write-Host "  Python Backend Job ID: $($pythonJob.Id)" -ForegroundColor White
    Write-Host "" -ForegroundColor White
    Write-Host "To check job status: Get-Job" -ForegroundColor Yellow
    Write-Host "To receive job output: Receive-Job <JobId>" -ForegroundColor Yellow
    Write-Host "To stop jobs: Stop-Job <JobId>, <JobId>" -ForegroundColor Yellow
    Write-Host "To remove jobs: Remove-Job <JobId>, <JobId>" -ForegroundColor Yellow
    Write-Host "" -ForegroundColor White
    Write-Host "Press Ctrl+C to stop monitoring (jobs will continue running)" -ForegroundColor Red
    
    # Monitor jobs
    try {
        while ($true) {
            Clear-Host
            Write-Host "=== Backend Service Status ===" -ForegroundColor Green
            Write-Host "Time: $(Get-Date)" -ForegroundColor White
            Write-Host "" -ForegroundColor White
            
            $goState = $goJob.State
            $pythonState = $pythonJob.State
            
            Write-Host "Go Backend: $goState" -ForegroundColor $(if($goState -eq "Running") {"Green"} else {"Red"})
            Write-Host "Python Backend: $pythonState" -ForegroundColor $(if($pythonState -eq "Running") {"Green"} else {"Red"})
            Write-Host "" -ForegroundColor White
            Write-Host "Services should be available at:" -ForegroundColor Cyan
            Write-Host "  Go API: http://localhost:8080" -ForegroundColor White
            Write-Host "  Python API: http://localhost:8000" -ForegroundColor White
            Write-Host "  Python Docs: http://localhost:8000/docs" -ForegroundColor White
            Write-Host "" -ForegroundColor White
            Write-Host "Press Ctrl+C to exit monitoring..." -ForegroundColor Yellow
            
            Start-Sleep 5
        }
    } finally {
        Write-Host "" -ForegroundColor White
        Write-Host "Monitoring stopped. Jobs are still running." -ForegroundColor Yellow
        Write-Host "Run 'Stop-Job <JobId>, <JobId>' to stop services." -ForegroundColor Yellow
    }
    
} else {
    Write-Host "Starting services sequentially..." -ForegroundColor Green
    Write-Host "Choose which backend to start:" -ForegroundColor Yellow
    Write-Host "1. Go Backend (port 8080)" -ForegroundColor White
    Write-Host "2. Python Backend (port 8000)" -ForegroundColor White
    Write-Host "3. Exit" -ForegroundColor White
    Write-Host "" -ForegroundColor White
    
    $choice = Read-Host "Enter your choice (1-3)"
    
    switch ($choice) {
        "1" {
            Start-GoBackend
        }
        "2" {
            Start-PythonBackend
        }
        "3" {
            Write-Host "Exiting..." -ForegroundColor Yellow
            exit 0
        }
        default {
            Write-Host "Invalid choice. Exiting..." -ForegroundColor Red
            exit 1
        }
    }
}
