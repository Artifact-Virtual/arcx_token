Write-Host "Starting ARCx Auction Interface Test Server..." -ForegroundColor Cyan
Write-Host "Interface will be available at: http://localhost:8080" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""
if (Get-Command python -ErrorAction SilentlyContinue) {
    python -m http.server 8080
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
    py -m http.server 8080
} else {
    Write-Host "Python not found. Install Python or use another web server." -ForegroundColor Red
    Write-Host "Alternative: Use 'npx serve .' if Node.js is installed" -ForegroundColor Yellow
}
