# Load environment variables from shared .env file
# This script loads the shared configuration for both Go and Python backends

$envPath = Join-Path $PSScriptRoot "..\config\.env"

if (Test-Path $envPath) {
    Write-Host "Loading environment variables from: $envPath" -ForegroundColor Green
    
    # Read and parse .env file
    Get-Content $envPath | ForEach-Object {
        $line = $_.Trim()
        
        # Skip empty lines and comments
        if ([string]::IsNullOrEmpty($line) -or $line.StartsWith('#')) {
            return
        }
        
        # Parse key=value pairs
        if ($line.Contains('=')) {
            $parts = $line -split '=', 2
            $key = $parts[0].Trim()
            $value = $parts[1].Trim()
            
            # Remove quotes if present
            if (($value.StartsWith('"') -and $value.EndsWith('"')) -or 
                ($value.StartsWith("'") -and $value.EndsWith("'"))) {
                $value = $value.Substring(1, $value.Length - 2)
            }
            
            # Set environment variable
            [System.Environment]::SetEnvironmentVariable($key, $value, "Process")
            Write-Host "Set: $key = ***MASKED***" -ForegroundColor Cyan
        }
    }
    
    Write-Host "Environment variables loaded successfully!" -ForegroundColor Green
    
    # Verify some key variables
    $glmKey = [System.Environment]::GetEnvironmentVariable("GLM_API_KEY")
    $moonshotKey = [System.Environment]::GetEnvironmentVariable("MOONSHOT_API_KEY")
    $debugMode = [System.Environment]::GetEnvironmentVariable("DEBUG")
    
    Write-Host "Verification:" -ForegroundColor Yellow
    Write-Host "  GLM API Key: $(if ($glmKey) { 'Present' } else { 'Not Found' })" -ForegroundColor White
    Write-Host "  Moonshot API Key: $(if ($moonshotKey) { 'Present' } else { 'Not Found' })" -ForegroundColor White
    Write-Host "  Debug Mode: $debugMode" -ForegroundColor White
    
} else {
    Write-Error "Environment file not found at: $envPath"
    Write-Host "Please ensure config/.env file exists with your API keys." -ForegroundColor Red
    exit 1
}

# Export all current environment variables for child processes
Get-ChildItem env: | ForEach-Object {
    [System.Environment]::SetEnvironmentVariable($_.Name, $_.Value, "Process")
}
