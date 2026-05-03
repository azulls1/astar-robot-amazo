# Arranca backend + frontend en dev en Windows (PowerShell).
# Abre cada uno en una ventana separada para que veas los logs.

$root = Split-Path -Parent $PSScriptRoot

$backendCmd = @"
cd '$root'
`$env:PYTHONIOENCODING = 'utf-8'
python -m uvicorn backend.app.main:app --port 8000 --reload
"@

$frontendCmd = @"
cd '$root\frontend'
npx ng serve --port 4200 --host 127.0.0.1
"@

Write-Host "Backend  -> http://localhost:8000  (nueva ventana)"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd

Write-Host "Frontend -> http://localhost:4200  (nueva ventana)"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd

Write-Host ""
Write-Host "Cierra las ventanas para detener los servicios."
