# GitLab CI/CD Pipeline Setup (Without Docker)

## Overview

This document explains how to set up and configure the GitLab CI/CD pipeline for the Attendance Management System **without using Docker**.

The pipeline builds and deploys directly to your server using Node.js and PM2.

## Pipeline Stages

### 1. **Build Stage**
- Installs frontend dependencies and builds with Vite
- Installs backend dependencies
- Caches node_modules for faster builds
- Uploads artifacts (dist/ and backend/)

### 2. **Test Stage**
- Runs tests on frontend code
- Runs tests on backend code
- Tests are marked as `allow_failure: true`

### 3. **Deploy Stage**
- Uploads built files to server via rsync
- Installs production dependencies on server
- Restarts backend with PM2
- Manual trigger required

---

## Prerequisites

### 1. GitLab Setup
- Push your project to GitLab

### 2. Server Requirements
- Ubuntu/Debian Linux server (or any Linux)
- Node.js 18+ installed
- PM2 installed globally: `npm install -g pm2`
- SSH access enabled
- rsync installed: `apt-get install rsync`

### 3. Nginx (Optional but Recommended)
For serving frontend and proxying API:
```bash
sudo apt-get install nginx
```

---

## Server Setup Instructions

### Step 1: Install Node.js and PM2

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Set PM2 to start on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp /home/$USER
```

### Step 2: Create Deploy User

```bash
# Create deploy user
sudo useradd -m -s /bin/bash deploy

# Add deploy user to sudo group
sudo usermod -aG sudo deploy

# Create SSH key for deploy user
sudo -u deploy mkdir -p /home/deploy/.ssh
sudo -u deploy chmod 700 /home/deploy/.ssh

# Create app directories
sudo mkdir -p /app/staging
sudo mkdir -p /app/production
sudo chown -R deploy:deploy /app
```

### Step 3: Generate SSH Key Pair

On your **local machine** (where you have the code):

```bash
# Generate SSH key (no passphrase for CI/CD)
ssh-keygen -t rsa -b 4096 -f ~/.ssh/gitlab-deploy -N ""

# Copy public key to server
ssh-copy-id -i ~/.ssh/gitlab-deploy.pub deploy@your-server-ip

# Verify connection
ssh -i ~/.ssh/gitlab-deploy deploy@your-server-ip
```

### Step 4: Configure GitLab CI/CD Variables

Go to **GitLab Project** → **Settings** → **CI/CD** → **Variables**

Add these variables:

| Variable | Value | Protected | Masked |
|----------|-------|-----------|--------|
| `SSH_PRIVATE_KEY` | Content of `~/.ssh/gitlab-deploy` | ✅ Yes | ✅ Yes |
| `STAGING_SERVER_IP` | Your staging server IP | ✅ Yes | No |
| `PRODUCTION_SERVER_IP` | Your production server IP | ✅ Yes | No |
| `DEPLOY_USER` | `deploy` | No | No |
| `VITE_API_URL` | `http://your-server:5000/api` (staging) | No | No |
| `MONGODB_URI` | MongoDB connection string | ✅ Yes | ✅ Yes |
| `JWT_SECRET` | Your JWT secret | ✅ Yes | ✅ Yes |
| `NODE_ENV` | `production` | No | No |

### Step 5: Set Up Environment Files on Server

SSH into your server:

```bash
ssh deploy@your-server-ip
```

Create `.env` files:

**For Staging** (`/app/staging/backend/.env`):
```bash
cat > /app/staging/backend/.env << EOF
NODE_ENV=staging
MONGODB_URI=mongodb://user:password@localhost:27017/attendance
JWT_SECRET=your-jwt-secret
PORT=5000
CORS_ORIGIN=http://your-staging-domain.com
LOG_LEVEL=info
EOF
```

**For Production** (`/app/production/backend/.env`):
```bash
cat > /app/production/backend/.env << EOF
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/attendance
JWT_SECRET=your-jwt-secret
PORT=5000
CORS_ORIGIN=https://your-domain.com
LOG_LEVEL=warn
EOF
```

---

## Nginx Configuration (Optional)

### Step 1: Create Nginx Config for Staging

```bash
sudo cat > /etc/nginx/sites-available/attendance-staging << 'EOF'
server {
    listen 80;
    server_name staging.yourdomain.com;

    # Frontend
    location / {
        root /app/staging/dist;
        try_files $uri $uri/ /index.html;
        expires 1h;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
```

### Step 2: Enable and Test

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/attendance-staging /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### Step 3: Add SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d staging.yourdomain.com

# Auto-renewal should be enabled by default
```

---

## GitLab Runner Setup (Optional)

If your GitLab instance requires a runner, install it on your server:

```bash
# Install GitLab Runner
curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh | bash
sudo apt-get install gitlab-runner

# Register runner
sudo gitlab-runner register \
  --url https://gitlab.com/ \
  --registration-token YOUR_RUNNER_TOKEN \
  --executor shell \
  --description "Attendance Project Runner" \
  --tag-list "deployment" \
  --run-untagged false
```

---

## Deployment Workflow

### First Deployment

1. **Push code to develop branch**:
   ```bash
   git push origin develop
   ```

2. **Monitor pipeline**:
   - Go to **CI/CD** → **Pipelines**
   - Watch build and test stages complete

3. **Manual deploy to staging**:
   - Click the **Deploy** button on staging job
   - Watch logs for deployment progress

4. **Verify staging**:
   ```bash
   # SSH to server
   ssh deploy@staging-server-ip
   
   # Check PM2 status
   pm2 status
   
   # View logs
   pm2 logs attendance-backend
   ```

5. **Test staging environment**:
   - Visit: `http://staging.yourdomain.com`
   - Test login, attendance, etc.

### Production Deployment

1. **Merge develop to main**:
   ```bash
   git checkout main
   git pull origin develop
   git push origin main
   ```

2. **Monitor pipeline** in GitLab

3. **Deploy to production**:
   - Click **Deploy** button on production job
   - Wait for completion

---

## Pipeline Workflow

### Branch Protection

**Main Branch** (Production)
- Runs build, test, and docker stages automatically
- Deploy to production requires manual trigger
- Requires successful tests before merge

**Develop Branch** (Staging)
- Runs build, test, and docker stages automatically
- Deploy to staging requires manual trigger

**Feature Branches** (Development)
- Runs build and test stages only
- No Docker build or deploy

### Running the Pipeline

1. **Push code to GitLab**:
   ```bash
   git push origin develop
   ```

2. **Monitor in GitLab**:
   - Go to **CI/CD** → **Pipelines**
   - Click on pipeline to see detailed status

3. **Manual Deployment**:
   - After build succeeds, go to pipeline
   - Click **Deploy** button next to the environment

---

## Server Management Commands

### View Application Status

```bash
# Check running processes
pm2 status

# View logs
pm2 logs attendance-backend

# Real-time monitoring
pm2 monit

# Restart app
pm2 restart attendance-backend

# Stop app
pm2 stop attendance-backend

# Start app
pm2 start /app/production/backend/server.js --name attendance-backend
```

### Database Backup

```bash
# Backup MongoDB
mongodump --uri="mongodb://user:password@localhost:27017/attendance" --out=/app/backups/$(date +%Y%m%d)

# Restore MongoDB
mongorestore --uri="mongodb://user:password@localhost:27017/attendance" /app/backups/20240101
```

### Logs and Monitoring

```bash
# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Application logs
pm2 logs attendance-backend --lines 100

# System logs
journalctl -u attendance-backend -f
```

---

## Troubleshooting

### Pipeline Fails at Build Stage

**Error**: `npm ci` fails
```bash
# Solution: Check package.json syntax
npm ci --dry-run
```

**Error**: Module not found
```bash
# Solution: Ensure all dependencies are in package.json
npm list --all
```

### Deployment Fails: SSH Connection Error

```bash
# Check SSH key permissions
ls -la ~/.ssh/id_rsa  # Should be 600

# Test SSH connection
ssh -v deploy@your-server-ip

# Check known_hosts
cat ~/.ssh/known_hosts | grep your-server-ip
```

### Application Won't Start After Deployment

```bash
# SSH to server
ssh deploy@your-server-ip

# Check PM2 logs
pm2 logs attendance-backend

# Check environment variables
cat /app/production/backend/.env

# Verify MongoDB connection
mongo "mongodb://localhost:27017/attendance"
```

### Nginx Returns 502 Bad Gateway

```bash
# Check if backend is running
pm2 status

# Check backend port
netstat -tulpn | grep 5000

# Check nginx config
sudo nginx -t

# View nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Slow Deployment (rsync taking too long)

```bash
# Exclude large directories in deployment
# Add to .gitignore:
# node_modules/
# dist/
# .next/
# build/
```

---

## Monitoring & Updates

### Set Up Health Checks

Add a health endpoint in your backend (`backend/server.js`):

```javascript
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});
```

### Monitor Disk Space

```bash
# Check disk usage
df -h

# Clean up old backups
find /app/backups -mtime +30 -delete
```

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update packages safely
npm update
npm audit fix
```

---

## Security Best Practices

### 1. SSH Key Security
- ✅ SSH key added to GitLab as Protected variable
- ✅ SSH key permissions set to 600
- ✅ Key stored securely on development machine

### 2. Environment Variables
- ✅ All secrets marked as Protected and Masked
- ✅ Different credentials for staging and production
- ✅ Regular rotation of JWT_SECRET

### 3. Firewall Configuration
```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Block direct access to backend port
sudo ufw deny 5000/tcp

# Enable UFW
sudo ufw enable
```

### 4. SSL/TLS Certificates
- Use Let's Encrypt (Certbot)
- Auto-renewal enabled
- Redirect HTTP → HTTPS

### 5. Database Security
- Use MongoDB credentials
- Restrict MongoDB access to localhost only
- Regular backups

---

## CI/CD Pipeline Diagram

```
┌─ Feature Branch ─────────────────────────────┐
│  [Build Frontend] → [Build Backend]          │
│  [Test Frontend] → [Test Backend]            │
│  ❌ No Deploy                                 │
└──────────────────────────────────────────────┘
                      ↓
        [Merge to develop]
                      ↓
┌─ Develop Branch ─────────────────────────────┐
│  [Build Frontend] → [Build Backend]          │
│  [Test Frontend] → [Test Backend]            │
│  [Manual] Deploy to Staging                  │
└──────────────────────────────────────────────┘
                      ↓
        [Testing on staging...]
                      ↓
        [Merge to main]
                      ↓
┌─ Main Branch ────────────────────────────────┐
│  [Build Frontend] → [Build Backend]          │
│  [Test Frontend] → [Test Backend]            │
│  [Manual] Deploy to Production               │
└──────────────────────────────────────────────┘
                      ↓
            ✅ Live in Production!
```

---

## Next Steps

1. ✅ Set up server with Node.js and PM2
2. ✅ Generate SSH keys and add to GitLab
3. ✅ Configure CI/CD variables in GitLab
4. ✅ Set up Nginx (optional)
5. ✅ Create .env files on server
6. ✅ Test first deployment to staging
7. ✅ Set up monitoring and backups
8. ✅ Deploy to production

---

## Support & Resources

- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [MongoDB Documentation](https://docs.mongodb.com/)

