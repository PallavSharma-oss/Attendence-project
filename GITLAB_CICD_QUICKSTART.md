# GitLab CI/CD Quick Start Guide (Without Docker)

## 5-Minute Setup

### 1. Push to GitLab
```bash
# Initialize git (if not already done)
git init

# Add GitLab remote
git remote add origin https://gitlab.com/your-username/attendance.git

# Push your code
git add .
git commit -m "Initial commit with CI/CD pipeline"
git push -u origin main
```

### 2. Create SSH Keys for Deployment

On your **local machine**:

```bash
# Generate SSH key pair
ssh-keygen -t rsa -b 4096 -f ~/.ssh/gitlab-deploy -N ""

# The key is now at ~/.ssh/gitlab-deploy
```

### 3. Set Up Your Server

SSH into your server:

```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Create deploy user
sudo useradd -m deploy
sudo mkdir -p /app/staging /app/production
sudo chown -R deploy:deploy /app

# Add your SSH public key to deploy user
mkdir -p /home/deploy/.ssh
cat ~/.ssh/gitlab-deploy.pub | sudo tee -a /home/deploy/.ssh/authorized_keys
sudo chown deploy:deploy /home/deploy/.ssh/authorized_keys
sudo chmod 600 /home/deploy/.ssh/authorized_keys
```

### 4. Configure GitLab Variables

1. Go to **GitLab** → Your Project → **Settings** → **CI/CD** → **Variables**
2. Add these variables (click **Add variable** for each):

```
SSH_PRIVATE_KEY = [Paste content of ~/.ssh/gitlab-deploy]
STAGING_SERVER_IP = [Your staging server IP]
PRODUCTION_SERVER_IP = [Your production server IP]
DEPLOY_USER = deploy
VITE_API_URL = http://your-server-ip:5000/api
MONGODB_URI = mongodb://user:password@localhost:27017/attendance
JWT_SECRET = your-super-secret-jwt-key
NODE_ENV = production
```

✅ Check boxes: **Protected** and **Masked** for `SSH_PRIVATE_KEY`, `MONGODB_URI`, `JWT_SECRET`

---

## Setup on Your Server

### Create Environment Files

SSH to your server and create environment configuration:

**Staging** (`/app/staging/backend/.env`):
```bash
ssh deploy@your-staging-server-ip
mkdir -p /app/staging/backend
cat > /app/staging/backend/.env << EOF
NODE_ENV=staging
MONGODB_URI=mongodb://user:password@localhost:27017/attendance
JWT_SECRET=your-jwt-secret
PORT=5000
CORS_ORIGIN=http://staging.yourdomain.com
LOG_LEVEL=info
EOF
exit
```

**Production** (`/app/production/backend/.env`):
```bash
ssh deploy@your-production-server-ip
mkdir -p /app/production/backend
cat > /app/production/backend/.env << EOF
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/attendance
JWT_SECRET=your-production-jwt-secret
PORT=5000
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=warn
EOF
exit
```

### Optional: Set Up Nginx

```bash
# SSH to your server
ssh deploy@your-server-ip

# Create nginx config
sudo cat > /etc/nginx/sites-available/attendance << 'EOF'
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /app/production/dist;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_set_header Host $host;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/attendance /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

### First Deployment

1. **Push code to develop branch**:
   ```bash
   git checkout -b develop
   git push -u origin develop
   ```

2. **Monitor pipeline** in GitLab:
   - Go to **CI/CD** → **Pipelines**
   - Wait for build & test to complete

3. **Deploy to staging**:
   - Click the **Deploy** button next to staging job
   - Watch the logs

4. **Verify deployment**:
   ```bash
   ssh deploy@your-staging-server-ip
   pm2 status
   pm2 logs attendance-backend
   ```

5. **Test application**:
   - Visit `http://your-staging-server-ip:3000`
   - Test login, attendance marking, etc.

---

## Manage Your Application

### View Application Logs

```bash
# SSH to server
ssh deploy@your-server-ip

# View real-time logs
pm2 logs attendance-backend

# View specific log lines
pm2 logs attendance-backend --lines 50

# Monitor with dashboard
pm2 monit
```

### Restart Application

```bash
# After updating code/env variables
pm2 restart attendance-backend

# Or manually
pm2 stop attendance-backend
pm2 start /app/production/backend/server.js --name attendance-backend
```

### Check Status

```bash
pm2 status
pm2 describe attendance-backend
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **Build fails: "node_modules not found"** | Run `npm ci` instead of `npm install` |
| **SSH connection refused** | Check SSH key permissions: `chmod 600 ~/.ssh/gitlab-deploy` |
| **Deployment times out** | Increase rsync timeout or check server connectivity |
| **Backend won't start** | Check environment variables: `cat /app/production/backend/.env` |
| **502 Bad Gateway from Nginx** | Verify backend is running: `pm2 status` |
| **MongoDB connection error** | Check MongoDB is running: `mongosh localhost:27017` |
| **VITE_API_URL not working** | Ensure variable is set correctly in GitLab CI/CD variables |

---

## Production Checklist

- [ ] SSH keys configured in GitLab variables
- [ ] Server environment files (.env) created
- [ ] MongoDB user/password set and secure
- [ ] JWT_SECRET is strong and unique
- [ ] Nginx configured with SSL (Let's Encrypt)
- [ ] Firewall rules blocking direct port 5000 access
- [ ] PM2 startup configured: `pm2 startup && pm2 save`
- [ ] Backup script scheduled (cron)
- [ ] Log rotation configured
- [ ] Health check endpoint added to backend
- [ ] Monitoring/alerting set up (optional)

---

## Production Deployment

1. **Test on staging first** - Always test changes on staging environment
2. **Merge to main**:
   ```bash
   git checkout main
   git pull origin develop
   git push origin main
   ```

3. **Monitor pipeline** - Watch build and test stages
4. **Manual deploy** - Click Deploy button in production job
5. **Verify**:
   ```bash
   ssh deploy@production-server
   pm2 status
   pm2 logs attendance-backend
   ```

---

## Database Backups

```bash
# SSH to server
ssh deploy@your-server-ip

# Create backup
mkdir -p /app/backups
mongodump --uri="mongodb://localhost:27017/attendance" --out=/app/backups/$(date +%Y%m%d-%H%M%S)

# List backups
ls -la /app/backups/

# Restore from backup
mongorestore --uri="mongodb://localhost:27017/attendance" /app/backups/20240101-120000
```

---

## CI/CD Pipeline Overview

```
Feature Branch
    ↓
  Build (test only)
    ↓
  Passed? → Merge to develop
    ↓
  Develop Branch (Build + Test)
    ↓
  Manual Deploy to Staging
    ↓
  Testing...
    ↓
  Merge to main
    ↓
  Main Branch (Build + Test)
    ↓
  Manual Deploy to Production
    ↓
  ✅ Live!
```

---

## Useful Links

- **Your Project Pipelines**: `https://gitlab.com/your-namespace/attendance/-/pipelines`
- **CI/CD Settings**: `https://gitlab.com/your-namespace/attendance/-/settings/ci_cd`
- **Deployments**: `https://gitlab.com/your-namespace/attendance/-/deployments`

---

## Getting Help

1. **Check pipeline logs** for specific error messages
2. **Enable debug logging**:
   ```bash
   # SSH to server and view detailed logs
   pm2 logs attendance-backend --err --out --lines 200
   ```
3. **Test locally** with Node.js before pushing
4. **Review** `.gitlab-ci.yml` syntax at https://docs.gitlab.com/ee/ci/yaml/

---

**You're ready! Push your code and watch the deployment happen.** 🚀

**Next Steps:**
1. ✅ Set up server with Node.js & PM2
2. ✅ Generate SSH keys
3. ✅ Add GitLab CI/CD variables
4. ✅ Create .env files on server
5. ✅ Push code to develop branch
6. ✅ Monitor pipeline
7. ✅ Deploy to staging
8. ✅ Test thoroughly
9. ✅ Deploy to production

