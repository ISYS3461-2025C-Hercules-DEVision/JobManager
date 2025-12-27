# Stop All JobManager Services
# This script stops Docker containers and all Java processes

Write-Host "=== Stopping JobManager System ===" -ForegroundColor Cyan

# Step 1: Stop Docker Infrastructure
Write-Host "`n[1/2] Stopping Docker Infrastructure..." -ForegroundColor Yellow
docker-compose down

# Step 2: Stop PowerShell background jobs
Write-Host "`n[2/3] Stopping Background Jobs..." -ForegroundColor Yellow

$jobs = Get-Job -ErrorAction SilentlyContinue
if ($jobs) {
    Write-Host "Found $($jobs.Count) background job(s)" -ForegroundColor Gray
    $jobs | Stop-Job
    $jobs | Remove-Job
    Write-Host "✅ All background jobs stopped" -ForegroundColor Green
} else {
    Write-Host "No background jobs found" -ForegroundColor Gray
}

# Step 3: Stop all Java processes (Spring Boot services)
Write-Host "`n[3/3] Stopping Spring Boot Services..." -ForegroundColor Yellow

$javaProcesses = Get-Process -Name "java" -ErrorAction SilentlyContinue

if ($javaProcesses) {
    Write-Host "Found $($javaProcesses.Count) Java process(es)" -ForegroundColor Gray
    
    foreach ($process in $javaProcesses) {
        try {
            $process | Stop-Process -Force
            Write-Host "✅ Stopped Java process (PID: $($process.Id))" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Could not stop process (PID: $($process.Id))" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "No Java processes found" -ForegroundColor Gray
}

Write-Host "`n=== All services stopped ===" -ForegroundColor Cyan
