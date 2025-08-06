# ARCx Dutch Auction Interface Deployment Script
Write-Host "=== ARCx Dutch Auction Interface Deployment ===" -ForegroundColor Cyan
Write-Host ""

if (-Not (Test-Path "auction_interface.html")) {
    Write-Host "ERROR: auction_interface.html not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Auction interface file found" -ForegroundColor Green

$deployDir = "deployment"
if (Test-Path $deployDir) {
    Remove-Item $deployDir -Recurse -Force
}
New-Item -ItemType Directory -Path $deployDir -Force | Out-Null
Write-Host "Created deployment directory" -ForegroundColor Green

Copy-Item "auction_interface.html" "$deployDir\index.html"
Write-Host "Copied auction interface as index.html" -ForegroundColor Green

Copy-Item "css" "$deployDir\css" -Recurse -Force
Write-Host "Copied CSS assets and logo" -ForegroundColor Green

$manifest = @'
{
  "name": "ARCx Dutch Auction Interface",
  "version": "1.0.0",
  "description": "Professional Web3 interface for ARCx token Dutch auction",
  "network": "Base L2 Mainnet",
  "contracts": {
    "arcx_token": "0xA4093669DAFbD123E37d52e0939b3aB3C2272f44",
    "dutch_auction": "0x5Da5F567553C8D4F12542Ba608F41626f77Aa836"
  },
  "features": [
    "MetaMask wallet connection",
    "Real-time auction pricing",
    "Base L2 network support",
    "Responsive design",
    "Professional ARCx branding"
  ],
  "status": "LIVE"
}
'@

$manifest | Out-File -FilePath "$deployDir\manifest.json" -Encoding UTF8
Write-Host "Created deployment manifest" -ForegroundColor Green

$serverScript = @'
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
'@

$serverScript | Out-File -FilePath "$deployDir\start_test_server.ps1" -Encoding UTF8
Write-Host "Created test server script" -ForegroundColor Green

$readme = @'
# ARCx Dutch Auction Interface - LIVE DEPLOYMENT

## Quick Start
The auction interface is ready for live deployment!

## Deployment Contents
- index.html - Main auction interface (Web3 enabled)
- css/ - Professional ARCx branding assets
- manifest.json - Deployment configuration
- start_test_server.ps1 - Local testing server

## Network Configuration
- Network: Base L2 Mainnet
- ARCx Token: 0xA4093669DAFbD123E37d52e0939b3aB3C2272f44
- Dutch Auction: 0x5Da5F567553C8D4F12542Ba608F41626f77Aa836
- Chain ID: 8453

## Features
- MetaMask wallet connection
- Real-time auction pricing
- Base L2 ultra-low gas costs
- Mobile-responsive design
- Professional Constitutional Intelligence branding
- Error handling & user feedback

## Local Testing
1. Open PowerShell in this directory
2. Run: .\start_test_server.ps1
3. Open browser to http://localhost:8080
4. Connect MetaMask to Base network
5. Test auction purchases

## Production Deployment Options

### Option 1: Static Site Hosting
- Netlify: Drag & drop the deployment folder
- Vercel: Deploy via GitHub or CLI
- GitHub Pages: Push to gh-pages branch
- AWS S3: Upload as static website

### Option 2: Custom Domain
- Copy all files to your web server
- Ensure HTTPS for Web3 functionality
- Configure CSP headers if needed

## Security Notes
- Interface connects directly to Base L2
- No backend required - fully client-side
- Users control their own private keys
- Audit-grade smart contracts

## Auction Status
Check live auction status at the interface or via:
- BaseScan: https://basescan.org/address/0x5Da5F567553C8D4F12542Ba608F41626f77Aa836

The interface is production-ready and fully functional!
'@

$readme | Out-File -FilePath "$deployDir\README.md" -Encoding UTF8
Write-Host "Created deployment README" -ForegroundColor Green

Write-Host ""
Write-Host "=== DEPLOYMENT READY ===" -ForegroundColor Green
Write-Host ""
Write-Host "Deployment folder: ./deployment/" -ForegroundColor Yellow
Write-Host "Main file: ./deployment/index.html" -ForegroundColor Yellow
Write-Host "Instructions: ./deployment/README.md" -ForegroundColor Yellow
Write-Host ""
Write-Host "DEPLOYMENT OPTIONS:" -ForegroundColor Cyan
Write-Host "1. Netlify Drop: Drag 'deployment' folder to netlify.com/drop" -ForegroundColor White
Write-Host "2. Vercel: Run 'npx vercel deploy deployment'" -ForegroundColor White
Write-Host "3. GitHub Pages: Push deployment folder to repository" -ForegroundColor White
Write-Host "4. Local Test: Run 'cd deployment && .\start_test_server.ps1'" -ForegroundColor White
Write-Host ""
Write-Host "ARCx auction interface is LIVE READY!" -ForegroundColor Green

