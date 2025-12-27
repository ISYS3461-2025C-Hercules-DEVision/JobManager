# Start All JobManager Services
# This script starts infrastructure (Docker) and all Spring Boot microservices

Write-Host "=== Starting JobManager System ===" -ForegroundColor Cyan

$ROOT = Get-Location

# Step 1: Start Docker Infrastructure
Write-Host "`n[1/3] Starting Docker Infrastructure..." -ForegroundColor Yellow
docker-compose up -d

Write-Host "Waiting for services to be ready..." -ForegroundColor Gray
Start-Sleep -Seconds 10

# Step 2: Start Spring Boot Services
Write-Host "`n[2/3] Starting Spring Boot Microservices..." -ForegroundColor Yellow

$services = @("discovery", "authentication", "company", "subscription", "payment", "notification", "job")

foreach ($service in $services) {
    $servicePath = Join-Path $ROOT $service
    
    if (Test-Path $servicePath) {
        Write-Host "`n--- Starting $service ---" -ForegroundColor Green
        
        # Load .env file for authentication service
        $envVars = @{}
        if ($service -eq "authentication") {
            $envFile = Join-Path $servicePath ".env"
            if (Test-Path $envFile) {
                Get-Content $envFile | ForEach-Object {
                    if ($_ -match '^([^=]+)=(.*)$') {
                        $envVars[$matches[1]] = $matches[2]
                    }
                }
                Write-Host "Loaded .env file" -ForegroundColor Gray
            }
        }
        
        # Start service as background job
        $jobName = "JobManager-$service"
        Start-Job -Name $jobName -ScriptBlock {
            param($path, $serviceName, $envVariables)
            Set-Location $path
            Write-Host "Starting $serviceName..." -ForegroundColor Cyan
            
            # Set environment variables
            foreach ($key in $envVariables.Keys) {
                [System.Environment]::SetEnvironmentVariable($key, $envVariables[$key])
            }
            
            if (Test-Path './gradlew.bat') {
                ./gradlew.bat bootRun
            } elseif (Test-Path './mvnw.cmd') {
                ./mvnw.cmd spring-boot:run
            } else {
                Write-Host "No build tool found" -ForegroundColor Red
            }
        } -ArgumentList $servicePath, $service, $envVars
        
        Write-Host "Started as background job: $jobName" -ForegroundColor Gray
        Start-Sleep -Seconds 5
    } else {
        Write-Host "Service folder not found, skipping: $service" -ForegroundColor Yellow
    }
}

# Step 3: Summary
Write-Host "`n[3/3] Summary" -ForegroundColor Yellow
Write-Host "Docker infrastructure started" -ForegroundColor Green
Write-Host "Spring Boot services starting as background jobs" -ForegroundColor Green
Write-Host "`nService URLs:" -ForegroundColor Cyan
Write-Host "  - Discovery (Eureka): http://localhost:8761" -ForegroundColor White
Write-Host "  - Kong Gateway: http://localhost:8000" -ForegroundColor White
Write-Host "  - Kong Admin UI: http://localhost:8002" -ForegroundColor White
Write-Host "  - Authentication: http://localhost:8080" -ForegroundColor White
Write-Host "  - Company: http://localhost:8081" -ForegroundColor White
Write-Host "  - Subscription: http://localhost:8083" -ForegroundColor White
Write-Host "  - Payment: http://localhost:8084" -ForegroundColor White

Write-Host "`n=== All services started ===" -ForegroundColor Cyan
Write-Host "Note: Services are running as background jobs" -ForegroundColor Gray
Write-Host "`nUseful commands:" -ForegroundColor Yellow
Write-Host "  Get-Job                    # List all running jobs" -ForegroundColor White
Write-Host "  Receive-Job -Name <name>   # View output from a job" -ForegroundColor White
Write-Host "  Stop-Job -Name <name>      # Stop a specific service" -ForegroundColor White
Write-Host "  Get-Job | Stop-Job         # Stop all services" -ForegroundColor White
Write-Host "  Get-Job | Remove-Job       # Remove completed jobs" -ForegroundColor White
