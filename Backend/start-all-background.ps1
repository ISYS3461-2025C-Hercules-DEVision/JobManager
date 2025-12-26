# Start All JobManager Services in Background
# All services run in background with logs saved to files

Write-Host "=== Starting JobManager System (Background Mode) ===" -ForegroundColor Cyan

$ROOT = Get-Location
$LOGS_DIR = Join-Path $ROOT "logs"

# Create logs directory
if (-not (Test-Path $LOGS_DIR)) {
    New-Item -ItemType Directory -Path $LOGS_DIR | Out-Null
    Write-Host "Created logs directory: $LOGS_DIR" -ForegroundColor Gray
}

# Step 1: Start Docker Infrastructure
Write-Host "`n[1/3] Starting Docker Infrastructure..." -ForegroundColor Yellow
docker-compose up -d

Write-Host "Waiting for services to be ready..." -ForegroundColor Gray
Start-Sleep -Seconds 10

# Step 2: Start Spring Boot Services in Background
Write-Host "`n[2/3] Starting Spring Boot Microservices (Background)..." -ForegroundColor Yellow

$services = @("discovery", "authentication", "company", "subscription", "payment", "notification", "job")

foreach ($service in $services) {
    $servicePath = Join-Path $ROOT $service
    $logFile = Join-Path $LOGS_DIR "$service.log"
    
    if (Test-Path $servicePath) {
        Write-Host "Starting $service..." -ForegroundColor Green -NoNewline
        
        # Start service in background
        $job = Start-Job -ScriptBlock {
            param($path, $log)
            Set-Location $path
            if (Test-Path "./gradlew.bat") {
                & ./gradlew.bat bootRun *>&1 | Tee-Object -FilePath $log
            } elseif (Test-Path "./mvnw.cmd") {
                & ./mvnw.cmd spring-boot:run *>&1 | Tee-Object -FilePath $log
            }
        } -ArgumentList $servicePath, $logFile
        
        Write-Host " (Job ID: $($job.Id), Log: logs\$service.log)" -ForegroundColor Gray
        
        # Wait 3 seconds between services
        Start-Sleep -Seconds 3
    } else {
        Write-Host "⚠️  $service folder not found, skipping..." -ForegroundColor Yellow
    }
}

# Step 3: Summary
Write-Host "`n[3/3] Summary" -ForegroundColor Yellow
Write-Host "✅ Docker infrastructure started" -ForegroundColor Green
Write-Host "✅ Spring Boot services starting in background" -ForegroundColor Green

Write-Host "`nService URLs:" -ForegroundColor Cyan
Write-Host "  - Discovery (Eureka): http://localhost:8761" -ForegroundColor White
Write-Host "  - Kong Gateway: http://localhost:8000" -ForegroundColor White
Write-Host "  - Kong Admin UI: http://localhost:8002" -ForegroundColor White
Write-Host "  - Authentication: http://localhost:8080" -ForegroundColor White
Write-Host "  - Company: http://localhost:8081" -ForegroundColor White
Write-Host "  - Subscription: http://localhost:8083" -ForegroundColor White
Write-Host "  - Payment: http://localhost:8084" -ForegroundColor White

Write-Host "`nMonitoring Commands:" -ForegroundColor Cyan
Write-Host "  View all jobs: Get-Job" -ForegroundColor White
Write-Host "  View logs: Get-Content logs\<service>.log -Wait" -ForegroundColor White
Write-Host "  Stop all: .\stop-all-services.ps1" -ForegroundColor White

Write-Host "`n=== All services started ===" -ForegroundColor Cyan
