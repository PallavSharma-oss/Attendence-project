# Windows Server Deployment Guide

## Complete Step-by-Step Deployment Instructions

### Phase 1: Server Prerequisites (1-2 hours)

#### Step 1: Install Node.js LTS
1. Download Node.js LTS from https://nodejs.org/
2. Run installer on Windows Server
3. Choose default installation path
4. Verify installation:
```powershell
node --version
npm --version
```

#### Step 2: Install MongoDB
**Option A: Local MongoDB**
1. Download from https://www.mongodb.com/try/download/community
2. Run installer with default settings
3. Service will auto-start
4. Verify:
```powershell
mongosh
# Type: exit
```

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Add IP address of Windows Server to whitelist
5. Create database user
6. Get connection string: `mongodb+srv://user:password@cluster.mongodb.net/attendance`

#### Step 3: Install Git (Optional but Recommended)
1. Download from https://git-scm.com/download/win
2. Run installer with default settings

---

### Phase 2: Backend Setup (30 minutes)

#### Step 4: Copy Backend Files
1. Copy entire project folder to Windows Server
   - Recommended location: `C:\Services\attendance-system\`
2. Navigate to backend folder:
```powershell
cd C:\Services\attendance-system\backend
```

#### Step 5: Install Backend Dependencies
```powershell
npm install
```

#### Step 6: Configure Backend Environment
Create `C:\Services\attendance-system\backend\.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/attendance
JWT_SECRET=your-super-secret-key-change-this-12345
JWT_EXPIRE=30d
NODE_ENV=production
ALLOWED_ORIGINS=http://localhost:3000,http://your-server-ip:3000,https://your-domain.com
```

#### Step 7: Test Backend
```powershell
npm run dev
# Should show: "Server running on port 5000"
# Press Ctrl+C to stop
```

#### Step 8: Install PM2 (Process Manager)
```powershell
npm install -g pm2
```

#### Step 9: Start Backend with PM2
```powershell
cd C:\Services\attendance-system\backend
pm2 start server.js --name "attendance-backend"
pm2 save
pm2 startup
```

Verify it's running:
```powershell
pm2 list
pm2 logs attendance-backend
```

---

### Phase 3: Frontend Setup (20 minutes)

#### Step 10: Install Frontend Dependencies
```powershell
cd C:\Services\attendance-system
npm install
```

#### Step 11: Configure Frontend Environment
Create `C:\Services\attendance-system\.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

For production, update to your domain:
```env
VITE_API_URL=https://your-domain.com/api
```

#### Step 12: Build Frontend
```powershell
npm run build
```

Output will be in `dist/` folder

#### Step 13: Serve Frontend with PM2
Install `serve` package:
```powershell
npm install -g serve
```

Start frontend:
```powershell
cd C:\Services\attendance-system
pm2 start "serve -s dist -l 3000" --name "attendance-frontend"
pm2 save
```

Verify:
```powershell
pm2 list
pm2 logs attendance-frontend
```

---

### Phase 4: Windows Firewall Configuration (10 minutes)

#### Step 14: Allow Ports Through Firewall
Open Windows Defender Firewall with Advanced Security and add inbound rules:

**Rule 1: Backend Port**
```powershell
netsh advfirewall firewall add rule name="Attendance Backend" dir=in action=allow protocol=tcp localport=5000
```

**Rule 2: Frontend Port**
```powershell
netsh advfirewall firewall add rule name="Attendance Frontend" dir=in action=allow protocol=tcp localport=3000
```

**Rule 3: MongoDB (if local)**
```powershell
netsh advfirewall firewall add rule name="MongoDB" dir=in action=allow protocol=tcp localport=27017
```

---

### Phase 5: Reverse Proxy Setup (Optional but Recommended)

#### Step 15: Install IIS (Internet Information Services)
1. Open Server Manager
2. Click "Add Roles and Features"
3. Select "Web Server (IIS)"
4. Install Application Request Routing (ARR) and URL Rewrite modules
5. Download from: https://www.iis.net/downloads

#### Step 16: Configure IIS Reverse Proxy
1. Open IIS Manager
2. Create new Site: "Attendance"
3. Binding: Port 80 (or 443 for HTTPS)
4. Install URL Rewrite extension
5. Add reverse proxy rules for:
   - Frontend: forward `/` to `http://localhost:3000/`
   - Backend: forward `/api/` to `http://localhost:5000/api/`

---

### Phase 6: Domain & SSL Setup (Optional)

#### Step 17: Configure Domain
1. Point your domain DNS to Windows Server IP
2. Update `.env` files with domain name
3. Rebuild frontend if needed:
```powershell
npm run build
```

#### Step 18: SSL Certificate (Let's Encrypt)
1. Install Certbot: https://certbot.eff.org/
2. Generate certificate:
```powershell
certbot certonly --standalone -d your-domain.com
```
3. Configure IIS with SSL binding

---

### Phase 7: Monitoring & Maintenance

#### Step 19: Auto-Start on Server Reboot
```powershell
pm2 startup
pm2 save
```

#### Step 20: Monitor Processes
```powershell
# View logs
pm2 logs

# View status
pm2 status

# Restart if needed
pm2 restart attendance-backend
pm2 restart attendance-frontend
```

#### Step 21: Enable MongoDB Persistence
If using local MongoDB:
```powershell
# MongoDB already runs as Windows Service
# Verify in Services.msc (search "services")
# Should see: "MongoDB"
```

---

## Verification Checklist

- [ ] Navigate to `http://localhost:3000` - Frontend loads
- [ ] Try login/register - Backend works
- [ ] Check attendance data - Database saves correctly
- [ ] Server accessible from other machines: `http://server-ip:3000`
- [ ] PM2 processes auto-start after reboot
- [ ] Firewall rules allow traffic

---

## Troubleshooting

### Backend won't start
```powershell
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Check logs
pm2 logs attendance-backend

# Verify MongoDB connection
mongosh
```

### Frontend won't load
```powershell
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Check logs
pm2 logs attendance-frontend

# Verify build was created
dir dist/
```

### MongoDB connection error
Update `.env` with correct connection string:
```env
# Local
MONGODB_URI=mongodb://localhost:27017/attendance

# Atlas Cloud
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/attendance?retryWrites=true&w=majority
```

### PM2 processes not persistent after reboot
```powershell
pm2 startup
# Follow instructions shown
pm2 save
```

---

## Production Best Practices

1. **Use HTTPS only** - Get SSL certificate
2. **Use MongoDB Atlas** - Don't use local MongoDB in production
3. **Environment variables** - Never commit `.env` files
4. **Backup database** - Set up automatic backups
5. **Monitor performance** - Use PM2 monitoring or Application Insights
6. **Set NODE_ENV=production** in `.env`
7. **Use reverse proxy** - IIS or nginx for load balancing
8. **Regular updates** - Keep Node.js and npm packages updated

---

## Quick Reference

```powershell
# Start services
pm2 start all
pm2 logs

# Stop services
pm2 stop all

# Restart services
pm2 restart all

# View running processes
pm2 list

# Check specific service logs
pm2 logs attendance-backend
pm2 logs attendance-frontend

# Remove a service
pm2 delete attendance-frontend

# Monit (watch resource usage)
pm2 monit
```

---

## Estimated Total Deployment Time
- First time: **2-4 hours**
- Subsequent deployments: **30 minutes**

---

## Support
For issues, check:
1. PM2 logs: `pm2 logs`
2. Event Viewer (Windows Logs)
3. Backend .env configuration
4. Firewall rules
5. MongoDB connection string
