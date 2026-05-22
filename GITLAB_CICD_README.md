# GitLab CI/CD Implementation Complete

Your attendance project is now ready for GitLab CI/CD deployment **without Docker**. 

## What Was Created

### 1. **`.gitlab-ci.yml`** - CI/CD Pipeline Configuration
The main pipeline file that automates:
- Building frontend & backend
- Running tests
- Deploying to staging & production via SSH + rsync

### 2. **`GITLAB_CICD_SETUP.md`** - Complete Setup Guide
Detailed instructions for:
- Server setup (Node.js, PM2, SSH)
- GitLab variable configuration
- Nginx setup (optional)
- Troubleshooting

### 3. **`GITLAB_CICD_QUICKSTART.md`** - Quick Start Guide
Get started in 5 minutes with step-by-step instructions.

### 4. **`docker-compose.prod.yml`** - Production Docker Compose
For reference if you want to use Docker later.

---

## Quick Start (Do This Now)

### Step 1: Push Code to GitLab (2 minutes)

```bash
# Navigate to your project
cd /path/to/ATTENDANCE

# Initialize git if needed
git init
git add .
git commit -m "Add GitLab CI/CD pipeline"

# Add GitLab remote
git remote add origin https://gitlab.com/YOUR-USERNAME/attendance.git

# Push to main branch
git push -u origin main
```

### Step 2: Generate SSH Keys (2 minutes)

```bash
# Generate SSH key pair
ssh-keygen -t rsa -b 4096 -f ~/.ssh/gitlab-deploy -N ""

# Copy the private key content (you'll need it for GitLab)
cat ~/.ssh/gitlab-deploy
```

### Step 3: Set Up Server (5 minutes)

```bash
# SSH to your server
ssh your-user@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Create deploy user and directories
sudo useradd -m deploy
sudo mkdir -p /app/staging /app/production
sudo chown -R deploy:deploy /app

# Add your SSH public key
mkdir -p /home/deploy/.ssh
cat ~/.ssh/gitlab-deploy.pub | sudo tee /home/deploy/.ssh/authorized_keys
sudo chown deploy:deploy /home/deploy/.ssh/authorized_keys
sudo chmod 600 /home/deploy/.ssh/authorized_keys
```

### Step 4: Configure GitLab CI/CD Variables (5 minutes)

1. Go to **GitLab** → Your Project → **Settings** → **CI/CD** → **Variables**

2. Add these variables:

| Variable | Value | Protected | Masked |
|----------|-------|-----------|--------|
| `SSH_PRIVATE_KEY` | Content of `~/.ssh/gitlab-deploy` | ✅ | ✅ |
| `STAGING_SERVER_IP` | Your staging server IP | ✅ | ❌ |
| `PRODUCTION_SERVER_IP` | Your prod server IP | ✅ | ❌ |
| `DEPLOY_USER` | `deploy` | ❌ | ❌ |
| `VITE_API_URL` | `http://your-server:5000/api` | ❌ | ❌ |
| `MONGODB_URI` | `mongodb://localhost:27017/attendance` | ✅ | ✅ |
| `JWT_SECRET` | Your JWT secret key | ✅ | ✅ |
| `NODE_ENV` | `production` | ❌ | ❌ |

### Step 5: Create Environment Files on Server (2 minutes)

SSH to server and create env files:

**Staging** (`/app/staging/backend/.env`):
```bash
ssh deploy@your-staging-server
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
ssh deploy@your-production-server
mkdir -p /app/production/backend
cat > /app/production/backend/.env << EOF
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/attendance
JWT_SECRET=your-production-secret
PORT=5000
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=warn
EOF
exit
```

### Step 6: Test Pipeline (2 minutes)

```bash
# Push to develop branch to trigger staging pipeline
git checkout -b develop
git push -u origin develop

# Go to GitLab → CI/CD → Pipelines
# Watch the build & test stages complete
```

### Step 7: Deploy to Staging (2 minutes)

1. Go to GitLab → **CI/CD** → **Pipelines**
2. Find the pipeline for your develop branch
3. Click the **Deploy** button next to "deploy:staging"
4. Watch the deployment logs

### Step 8: Verify Staging (2 minutes)

```bash
ssh deploy@your-staging-server
pm2 status
pm2 logs attendance-backend
```

Visit: `http://your-staging-server:3000` in your browser

---

## Pipeline Workflow

### Branch Strategy

```
feature/my-feature → develop → staging → main → production
```

### Deployment Process

1. **Feature Development**: Create feature branch from develop
   ```bash
   git checkout -b feature/my-feature develop
   git push -u origin feature/my-feature
   ```

2. **Merge to Develop**: When feature is ready
   ```bash
   git checkout develop
   git pull origin develop
   git merge feature/my-feature
   git push origin develop
   ```
   - Pipeline runs: Build → Test ✅
   - Staging deployment: Manual trigger

3. **Merge to Main**: After testing on staging
   ```bash
   git checkout main
   git pull origin develop
   git push origin main
   ```
   - Pipeline runs: Build → Test ✅
   - Production deployment: Manual trigger

---

## Important Commands

### View Pipeline Status
```bash
# In GitLab: CI/CD → Pipelines
# Or via CLI:
git log --oneline -5  # See recent commits
```

### Manage Application on Server
```bash
# SSH to server
ssh deploy@your-server-ip

# View status
pm2 status

# View logs
pm2 logs attendance-backend

# Restart app
pm2 restart attendance-backend

# Stop/Start
pm2 stop attendance-backend
pm2 start /app/production/backend/server.js --name attendance-backend
```

### Database Management
```bash
# Backup
mongodump --uri="mongodb://localhost:27017/attendance" --out=/app/backups/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb://localhost:27017/attendance" /app/backups/20240101
```

---

## Architecture Diagram

```
Your Local Machine
    ↓
    ├─ git push origin develop
    ↓
GitLab Repository
    ↓
    ├─ Build Frontend (npm ci, npm run build)
    ├─ Build Backend (npm ci)
    ├─ Test Frontend & Backend
    ↓
    ├─ [Manual] Deploy to Staging
    │   ├─ rsync files to staging server
    │   ├─ npm install --production
    │   ├─ pm2 restart
    │   ↓
    │   Staging Server (test environment)
    │
    └─ [After Testing] Merge to main
        ↓
        ├─ Build Frontend
        ├─ Build Backend
        ├─ Test
        ↓
        ├─ [Manual] Deploy to Production
        │   ├─ rsync files to production server
        │   ├─ npm install --production
        │   ├─ pm2 restart
        │   ↓
        │   Production Server (live environment)
```

---

## Troubleshooting

### Pipeline Fails to Build
```bash
# Check package.json for syntax errors
npm ci --dry-run

# Verify all dependencies are installed
npm list --all
```

### Deployment Fails (SSH Error)
```bash
# Test SSH connection
ssh -v deploy@your-server-ip

# Check SSH key permissions
ls -la ~/.ssh/gitlab-deploy  # Should be 600

# Verify server has your public key
ssh deploy@your-server-ip cat ~/.ssh/authorized_keys
```

### Application Won't Start
```bash
# SSH to server and check logs
ssh deploy@your-server-ip
pm2 logs attendance-backend

# Check environment variables
cat /app/production/backend/.env

# Verify MongoDB
mongosh localhost:27017
```

### Nginx Returns 502
```bash
# Check if backend is running
pm2 status

# Check backend port
netstat -tulpn | grep 5000

# Check nginx config
sudo nginx -t

# View nginx errors
sudo tail -f /var/log/nginx/error.log
```

---

## Security Best Practices

✅ **SSH Key Security**
- SSH private key stored securely on local machine
- SSH key added as Protected & Masked variable in GitLab
- SSH key has no passphrase (for automation)

✅ **Secrets Management**
- All sensitive variables marked Protected & Masked
- Different credentials for staging and production
- Environment files NOT committed to git

✅ **Network Security**
- Firewall blocks direct port 5000 access
- Nginx acts as reverse proxy (port 80/443)
- SSL/TLS certificates via Let's Encrypt

✅ **Database Security**
- MongoDB authentication enabled
- Access restricted to localhost
- Regular backups

---

## Next Steps

1. ✅ Complete the Quick Start above
2. **Set up Nginx** (optional): See GITLAB_CICD_SETUP.md
3. **Add SSL certificate** (recommended): `certbot --nginx`
4. **Set up monitoring**: Configure email/Slack alerts
5. **Configure backups**: Schedule daily MongoDB backups
6. **Monitor logs**: Watch application logs for issues
7. **Scale up**: Add more servers as needed

---

## Documentation

- **[GITLAB_CICD_QUICKSTART.md](GITLAB_CICD_QUICKSTART.md)** - Fast start guide
- **[GITLAB_CICD_SETUP.md](GITLAB_CICD_SETUP.md)** - Detailed configuration
- **[.gitlab-ci.yml](.gitlab-ci.yml)** - Pipeline definition

---

## Support Resources

- [GitLab CI/CD Docs](https://docs.gitlab.com/ee/ci/)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Docs](https://nginx.org/)
- [Node.js Docs](https://nodejs.org/docs/)

---

**Your CI/CD pipeline is ready! Start with the Quick Start section above.** 🚀

