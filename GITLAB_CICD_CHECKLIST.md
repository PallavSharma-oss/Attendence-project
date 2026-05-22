# GitLab CI/CD Setup Checklist

Use this checklist to track your progress through the setup process.

---

## Phase 1: Initial Setup ⏱️ Estimated Time: 15 minutes

### GitLab Repository
- [ ] Code pushed to GitLab repository
- [ ] Repository URL: `https://gitlab.com/______/______`
- [ ] `main` branch exists with code
- [ ] `.gitlab-ci.yml` file is in repository root

### SSH Keys
- [ ] SSH key pair generated: `ssh-keygen -t rsa -b 4096 -f ~/.ssh/gitlab-deploy -N ""`
- [ ] Private key location: `~/.ssh/gitlab-deploy`
- [ ] Public key location: `~/.ssh/gitlab-deploy.pub`

---

## Phase 2: Server Setup ⏱️ Estimated Time: 10 minutes per server

### For Each Server (Staging & Production)

#### Server Access
- [ ] **Server IP**: `________________`
- [ ] **Server Type**: Staging / Production / Both
- [ ] SSH access verified: `ssh your-user@your-server-ip`
- [ ] Can run `sudo` commands

#### Install Node.js & PM2
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```
- [ ] Node.js installed: `node --version`
- [ ] PM2 installed: `pm2 --version`

#### Create Deploy User
```bash
sudo useradd -m deploy
sudo mkdir -p /app/staging /app/production
sudo chown -R deploy:deploy /app
```
- [ ] Deploy user created: `id deploy`
- [ ] App directories created and owned by deploy user
- [ ] SSH access works: `ssh deploy@your-server-ip`

#### Add SSH Public Key
```bash
mkdir -p /home/deploy/.ssh
# Add public key to authorized_keys
```
- [ ] SSH key added to `/home/deploy/.ssh/authorized_keys`
- [ ] Permissions correct: 700 for .ssh, 600 for authorized_keys
- [ ] SSH login works without password: `ssh deploy@your-server-ip`

---

## Phase 3: GitLab Configuration ⏱️ Estimated Time: 5 minutes

### CI/CD Variables Setup

Go to: **GitLab** → Your Project → **Settings** → **CI/CD** → **Variables**

**Step 1: SSH Configuration**
- [ ] `SSH_PRIVATE_KEY` added
  - [ ] Value: Content of `~/.ssh/gitlab-deploy`
  - [ ] Protected: ✅ Yes
  - [ ] Masked: ✅ Yes

**Step 2: Server Configuration**
- [ ] `STAGING_SERVER_IP` added
  - [ ] Value: `________________`
  - [ ] Protected: ✅ Yes
  - [ ] Masked: ❌ No

- [ ] `PRODUCTION_SERVER_IP` added
  - [ ] Value: `________________`
  - [ ] Protected: ✅ Yes
  - [ ] Masked: ❌ No

- [ ] `DEPLOY_USER` added
  - [ ] Value: `deploy`
  - [ ] Protected: ❌ No
  - [ ] Masked: ❌ No

**Step 3: API Configuration**
- [ ] `VITE_API_URL` added
  - [ ] Value: `http://your-server:5000/api`
  - [ ] Protected: ❌ No
  - [ ] Masked: ❌ No

**Step 4: Database Configuration**
- [ ] `MONGODB_URI` added
  - [ ] Value: Your MongoDB connection string
  - [ ] Protected: ✅ Yes
  - [ ] Masked: ✅ Yes

- [ ] `JWT_SECRET` added
  - [ ] Value: Your JWT secret (strong, random string)
  - [ ] Protected: ✅ Yes
  - [ ] Masked: ✅ Yes

**Step 5: Environment Configuration**
- [ ] `NODE_ENV` added
  - [ ] Value: `production`
  - [ ] Protected: ❌ No
  - [ ] Masked: ❌ No

**Verify**: All 8 variables are added
- [ ] `SSH_PRIVATE_KEY`
- [ ] `STAGING_SERVER_IP`
- [ ] `PRODUCTION_SERVER_IP`
- [ ] `DEPLOY_USER`
- [ ] `VITE_API_URL`
- [ ] `MONGODB_URI`
- [ ] `JWT_SECRET`
- [ ] `NODE_ENV`

---

## Phase 4: Server Configuration ⏱️ Estimated Time: 5 minutes per server

### For Staging Server

**Create Environment File**
```bash
ssh deploy@staging-server-ip
mkdir -p /app/staging/backend
# Create .env file
```
- [ ] `.env` file created at `/app/staging/backend/.env`
- [ ] Contains: `NODE_ENV=staging`
- [ ] Contains: `MONGODB_URI=...`
- [ ] Contains: `JWT_SECRET=...`
- [ ] Contains: `PORT=5000`

### For Production Server

**Create Environment File**
```bash
ssh deploy@production-server-ip
mkdir -p /app/production/backend
# Create .env file
```
- [ ] `.env` file created at `/app/production/backend/.env`
- [ ] Contains: `NODE_ENV=production`
- [ ] Contains: `MONGODB_URI=...` (production MongoDB)
- [ ] Contains: `JWT_SECRET=...` (production secret)
- [ ] Contains: `PORT=5000`

### Optional: Nginx Setup

- [ ] Nginx installed: `sudo apt-get install nginx`
- [ ] Nginx config created for staging
- [ ] Nginx config created for production
- [ ] Nginx tested: `sudo nginx -t`
- [ ] Nginx restarted: `sudo systemctl restart nginx`

### Optional: SSL Certificate

- [ ] Certbot installed: `sudo apt-get install certbot python3-certbot-nginx`
- [ ] Certificate obtained: `sudo certbot --nginx -d yourdomain.com`
- [ ] Certificate auto-renewal enabled
- [ ] HTTP → HTTPS redirect configured

---

## Phase 5: Testing ⏱️ Estimated Time: 10 minutes

### Test Git Workflow

```bash
git checkout -b develop
git push -u origin develop
```
- [ ] `develop` branch created and pushed

### Test Pipeline Execution

- [ ] Go to GitLab → **CI/CD** → **Pipelines**
- [ ] Pipeline started automatically for `develop` branch
- [ ] `build:frontend` job completed ✅
- [ ] `build:backend` job completed ✅
- [ ] `test:frontend` job completed or allowed to fail ⚠️
- [ ] `test:backend` job completed or allowed to fail ⚠️

### Test Staging Deployment

- [ ] Go to pipeline for `develop` branch
- [ ] Click **Deploy** button next to `deploy:staging` job
- [ ] Watch deployment logs
- [ ] Job completed successfully ✅
- [ ] No errors in logs

### Verify Staging Application

```bash
ssh deploy@staging-server-ip
pm2 status
pm2 logs attendance-backend
```
- [ ] SSH into staging server successful
- [ ] `pm2 status` shows `attendance-backend` running
- [ ] No errors in PM2 logs
- [ ] Frontend accessible: `http://staging-server-ip:3000`
- [ ] API accessible: `curl http://staging-server-ip:5000/api/health`

### Test Production Pipeline (Without Deployment)

```bash
git checkout main
git merge develop
git push origin main
```
- [ ] Code pushed to `main` branch
- [ ] Pipeline started automatically
- [ ] All build & test jobs completed ✅
- [ ] Production pipeline shows `deploy:production` job (not triggered yet)

### **DO NOT** Deploy to Production Yet

- [ ] Thoroughly test staging environment first
- [ ] Verify all features work on staging
- [ ] Test login, attendance, leave, admin functions
- [ ] Check database operations
- [ ] Monitor logs for any errors

---

## Phase 6: Documentation ⏱️ Estimated Time: 2 minutes

- [ ] Read `GITLAB_CICD_README.md` (overview)
- [ ] Read `GITLAB_CICD_QUICKSTART.md` (fast guide)
- [ ] Read `GITLAB_CICD_SETUP.md` (detailed setup)
- [ ] Bookmark useful commands for later

---

## Phase 7: Production Deployment ⏱️ Do Only After Testing Staging

### Pre-Deployment Checklist
- [ ] Staging fully tested and working
- [ ] All features verified on staging
- [ ] No errors in staging logs
- [ ] Database backups working
- [ ] Production server SSH access verified
- [ ] Production `.env` file created and verified

### Deploy to Production

1. **Go to GitLab Pipeline** for `main` branch
2. **Click Deploy** button next to `deploy:production` job
3. **Watch logs** for any errors
4. **Verify deployment**:
   ```bash
   ssh deploy@production-server-ip
   pm2 status
   pm2 logs attendance-backend
   ```
- [ ] Production application running: `pm2 status`
- [ ] No errors in logs: `pm2 logs attendance-backend`
- [ ] Frontend accessible: `https://yourdomain.com`
- [ ] API accessible: `curl https://yourdomain.com/api/health`

### Post-Deployment
- [ ] Monitor logs for 15 minutes
- [ ] Test all features on production
- [ ] Check database operations
- [ ] Verify SSL/HTTPS working
- [ ] Monitor application performance

---

## Phase 8: Ongoing Maintenance

### Daily
- [ ] Check application logs: `pm2 logs attendance-backend`
- [ ] Monitor PM2 status: `pm2 status`
- [ ] Verify uptime and performance

### Weekly
- [ ] Test backup/restore process
- [ ] Review application logs for errors
- [ ] Monitor disk space: `df -h`

### Monthly
- [ ] Update dependencies: `npm update`
- [ ] Run security audit: `npm audit fix`
- [ ] Review and rotate JWT_SECRET if needed
- [ ] Update SSL certificates (auto-renewal should handle)

### Quarterly
- [ ] Major version updates
- [ ] Security patches
- [ ] Performance optimization
- [ ] Capacity planning

---

## Important Information to Save

### Server Information
```
Staging Server IP: ________________
Staging Username: deploy
Production Server IP: ________________
Production Username: deploy
GitLab Project URL: https://gitlab.com/______/______
```

### Credentials (Store Securely!)
```
MongoDB User: ________________
MongoDB Password: ________________
JWT Secret: ________________
```

### Important Commands
```
# SSH to staging
ssh deploy@{STAGING_SERVER_IP}

# SSH to production
ssh deploy@{PRODUCTION_SERVER_IP}

# View logs
pm2 logs attendance-backend

# Restart app
pm2 restart attendance-backend

# Backup database
mongodump --uri="mongodb://localhost:27017/attendance" --out=/app/backups/$(date +%Y%m%d)
```

---

## Support & Help

- **Pipeline Issues**: Check `.gitlab-ci.yml` syntax
- **Server Issues**: SSH to server and check PM2 logs
- **Deployment Errors**: Review deployment job logs in GitLab
- **Application Issues**: Check application logs: `pm2 logs`
- **Database Issues**: Verify MongoDB is running and accessible

---

## Completion Status

**Overall Progress**: _____ / 100%

- Phase 1 (Initial Setup): [ ] 0% [ ] 25% [ ] 50% [ ] 75% [ ] ✅ 100%
- Phase 2 (Server Setup): [ ] 0% [ ] 25% [ ] 50% [ ] 75% [ ] ✅ 100%
- Phase 3 (GitLab Config): [ ] 0% [ ] 25% [ ] 50% [ ] 75% [ ] ✅ 100%
- Phase 4 (Server Config): [ ] 0% [ ] 25% [ ] 50% [ ] 75% [ ] ✅ 100%
- Phase 5 (Testing): [ ] 0% [ ] 25% [ ] 50% [ ] 75% [ ] ✅ 100%
- Phase 6 (Documentation): [ ] 0% [ ] 25% [ ] 50% [ ] 75% [ ] ✅ 100%
- Phase 7 (Production): [ ] 0% [ ] 25% [ ] 50% [ ] 75% [ ] ✅ 100%
- Phase 8 (Maintenance): [ ] Ongoing

---

**Date Started**: ________________
**Date Completed**: ________________

**Deployed to Staging**: ________________
**Deployed to Production**: ________________

