$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Start-Process powershell -ArgumentList '-NoExit','-Command',"Set-Location '$root\backend'; if (!(Test-Path .env)) { Copy-Item .env.example .env }; npm install; npm run dev"
Start-Process powershell -ArgumentList '-NoExit','-Command',"Set-Location '$root\frontend'; npm install; npm run dev"
Write-Host 'Both terminals opened. Ensure MySQL is running and backend\.env contains your MySQL password.'
