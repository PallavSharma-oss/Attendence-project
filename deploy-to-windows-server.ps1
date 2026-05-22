# Automated Windows Server Deployment Script
# Run as Administrator in PowerShell
# Usage: .\deploy-to-windows-server.ps1

# === Configuration ===
$PROJECT_PATH = "C:\Services\attendance-system"
$BACKEND_PORT = 5000
$FRONTEND_PORT = 3000
$MONGODB_CONNECTION = "mongodb://localhost:27017/attendance"

Write-Host "🚀 Starting Attendance System Deployment..." -ForegroundColor Green

# === Phase 1: Check Prerequisites ===
Write-Host "`n📋 Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js not installed. Please install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js installed: $(node --version)" -ForegroundColor Green

# Check MongoDB
if (!(Get-Command mongosh -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️  MongoDB not found. Using Atlas connection (cloud)" -ForegroundColor Yellow
    $MONGODB_CONNECTION = Read-Host "Enter MongoDB Atlas connection string"
}

# === Phase 2: Install Global Tools ===
Write-Host "`n🔧 Installing global tools..." -ForegroundColor Yellow

npm install -g pm2 serve --silent
Write-Host "✅ Global tools installed" -ForegroundColor Green

# === Phase 3: Backend Setup ===
Write-Host "`n⚙️  Setting up Backend..." -ForegroundColor Yellow

if (!(Test-Path $PROJECT_PATH)) {
    Write-Host "❌ Project path not found: $PROJECT_PATH" -ForegroundColor Red
    exit 1
}

Push-Location "$PROJECT_PATH\backend"

# Install backend dependencies
Write-Host "Installing backend dependencies..."
npm install --silent

# Create .env if doesn't exist
if (!(Test-Path ".env")) {
    Write-Host "Creating backend .env file..."
    @"
PORT=$BACKEND_PORT
MONGODB_URI=$MONGODB_CONNECTION
JWT_SECRET=your-super-secret-key-change-this-12345
JWT_EXPIRE=30d
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Backend .env created (update JWT_SECRET!)" -ForegroundColor Green
}

# Kill existing PM2 process
pm2 delete attendance-backend -s 2>$null

# Start backend
pm2 start server.js --name "attendance-backend" --silent
Write-Host "✅ Backend started on port $BACKEND_PORT" -ForegroundColor Green

Pop-Location

# === Phase 4: Frontend Setup ===
Write-Host "`n🎨 Setting up Frontend..." -ForegroundColor Yellow

Push-Location $PROJECT_PATH

# Install frontend dependencies
Write-Host "Installing frontend dependencies..."
npm install --silent

# Create .env if doesn't exist
if (!(Test-Path ".env")) {
    @"
VITE_API_URL=http://localhost:$BACKEND_PORT/api
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Frontend .env created" -ForegroundColor Green
}

# Build frontend
Write-Host "Building frontend..."
npm run build --silent

# Kill existing PM2 process
pm2 delete attendance-frontend -s 2>$null

# Start frontend
pm2 start "serve -s dist -l $FRONTEND_PORT" --name "attendance-frontend" --silent
Write-Host "✅ Frontend built and started on port $FRONTEND_PORT" -ForegroundColor Green

Pop-Location

# === Phase 5: PM2 Persistence ===
Write-Host "`n💾 Setting up auto-start on reboot..." -ForegroundColor Yellow

pm2 save
pm2 startup -s 2>$null
Write-Host "✅ PM2 configured for auto-start" -ForegroundColor Green

# === Phase 6: Firewall Rules ===
Write-Host "`n🔒 Configuring Windows Firewall..." -ForegroundColor Yellow

# Allow backend port
netsh advfirewall firewall add rule name="Attendance Backend" dir=in action=allow protocol=tcp localport=$BACKEND_PORT 2>$null
Write-Host "✅ Backend port $BACKEND_PORT allowed" -ForegroundColor Green

# Allow frontend port
netsh advfirewall firewall add rule name="Attendance Frontend" dir=in action=allow protocol=tcp localport=$FRONTEND_PORT 2>$null
Write-Host "✅ Frontend port $FRONTEND_PORT allowed" -ForegroundColor Green

# === Phase 7: Summary ===
Write-Host "`n" -ForegroundColor Green
Write-Host "════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════" -ForegroundColor Green

Write-Host "`n📍 Access your application:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:$FRONTEND_PORT" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:$BACKEND_PORT/api" -ForegroundColor Cyan

Write-Host "`n📊 Running Processes:" -ForegroundColor Cyan
pm2 list

Write-Host "`n💡 Useful Commands:" -ForegroundColor Yellow
Write-Host "   pm2 logs              - View logs" -ForegroundColor Yellow
Write-Host "   pm2 status            - Check status" -ForegroundColor Yellow
Write-Host "   pm2 restart all       - Restart all services" -ForegroundColor Yellow
Write-Host "   pm2 stop all          - Stop all services" -ForegroundColor Yellow
Write-Host "   pm2 monit             - Monitor resources" -ForegroundColor Yellow

Write-Host "`n⚠️  IMPORTANT: Update backend .env with:" -ForegroundColor Red
Write-Host "   - JWT_SECRET (use a real secret)" -ForegroundColor Red
Write-Host "   - MONGODB_URI (if using Atlas)" -ForegroundColor Red
Write-Host "   - ALLOWED_ORIGINS (add your domain)" -ForegroundColor Red

Write-Host ""
