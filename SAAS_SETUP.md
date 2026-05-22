# SaaS Setup Guide - Monthly Subscription Model

## Overview
Host the attendance system yourself. Clients pay ₹1000-2000/month for access. You keep the code, handle updates, manage data.

---

## Architecture

```
Your Server (DigitalOcean/AWS)
├── Backend API (Node.js)
├── Frontend (React)
├── Database (MongoDB/Firestore)
└── License Manager

Client 1 (Company A) → License Key 1 → Separate Database
Client 2 (Company B) → License Key 2 → Separate Database
Client 3 (Company C) → License Key 3 → Separate Database
```

---

## Step 1: Set Up Cloud Server

### Option 1: DigitalOcean (Easiest, ₹150-300/month)
1. Create account at digitalocean.com
2. Create Droplet: Ubuntu 22.04, 2GB RAM, ₹150/month
3. SSH into server:
```bash
ssh root@your_droplet_ip
```

### Option 2: AWS (More complex, ₹100-500/month)
- EC2 instance (t2.micro free tier)
- RDS for database
- S3 for file storage

### Option 3: Heroku (Easy but expensive, ₹800+/month)
- Deploy directly with git
- Auto-scaling included

**RECOMMENDED: DigitalOcean** - Cheapest, easiest setup

---

## Step 2: Update Backend for Multi-Tenancy

### 2.1 Update User Model

```javascript
// backend/models/User.js
const userSchema = new Schema({
  employeeId: String,
  name: String,
  email: String,
  organizationId: String,  // ← NEW: Multi-tenancy
  licenseKey: String,      // ← NEW: Track which org
  role: String,
  status: String,
  faceDescriptor: Array,
  createdAt: { type: Date, default: Date.now }
});

// Index by organization for fast queries
userSchema.index({ organizationId: 1 });
```

### 2.2 Update All Models (Attendance, Leave, etc)

Add `organizationId` to every model:
```javascript
const attendanceSchema = new Schema({
  organizationId: String,  // ← Add this
  userId: String,
  checkInTime: Date,
  // ... rest of fields
});
attendanceSchema.index({ organizationId: 1 });
```

### 2.3 Update Middleware - Auto-Add Organization

```javascript
// backend/middleware/organizationMiddleware.js

const organizationMiddleware = (req, res, next) => {
  const licenseKey = req.headers['x-license-key'];
  
  if (!licenseKey) {
    return res.status(403).json({ error: 'License key missing' });
  }
  
  // Lookup organization by license key
  const org = getOrganizationByLicense(licenseKey);
  
  if (!org) {
    return res.status(403).json({ error: 'Invalid license key' });
  }
  
  if (new Date() > new Date(org.subscriptionExpiry)) {
    return res.status(403).json({ error: 'Subscription expired' });
  }
  
  // Attach to request
  req.organizationId = org._id;
  req.license = org;
  
  next();
};

module.exports = organizationMiddleware;
```

### 2.4 Update All Routes to Use Organization

```javascript
// backend/routes/attendance.js

router.get('/attendance/list', organizationMiddleware, async (req, res) => {
  // Filter by organization automatically
  const records = await Attendance.find({
    organizationId: req.organizationId  // ← Auto-filtered
  });
  res.json(records);
});

router.post('/attendance/checkin', organizationMiddleware, async (req, res) => {
  const attendance = new Attendance({
    organizationId: req.organizationId,  // ← Auto-added
    userId: req.body.userId,
    checkInTime: new Date(),
    // ...
  });
  await attendance.save();
  res.json(attendance);
});
```

---

## Step 3: Create License/Organization Management

```javascript
// backend/models/Organization.js
const organizationSchema = new Schema({
  name: String,
  email: String,
  subscriptionTier: { type: String, enum: ['startup', 'business', 'enterprise'] },
  licenseKey: { type: String, unique: true },
  maxEmployees: Number,
  currentEmployees: { type: Number, default: 0 },
  subscriptionStartDate: Date,
  subscriptionExpiry: Date,
  paymentStatus: { type: String, enum: ['pending', 'active', 'expired'] },
  razorpaySubscriptionId: String,
  createdAt: { type: Date, default: Date.now },
  features: {
    faceRecognition: Boolean,
    qrCodeCheckIn: Boolean,
    leaveManagement: Boolean,
    mobileApp: Boolean,
    reports: Boolean
  }
});

module.exports = Organization;
```

```javascript
// backend/utils/licensingManager.js
const crypto = require('crypto');
const Organization = require('../models/Organization');

async function createOrganization(data) {
  const licenseKey = generateLicenseKey();
  
  const org = new Organization({
    name: data.companyName,
    email: data.contactEmail,
    licenseKey,
    subscriptionTier: data.tier,
    maxEmployees: getTierLimit(data.tier),
    subscriptionStartDate: new Date(),
    subscriptionExpiry: addMonths(new Date(), 1),
    paymentStatus: 'pending',
    features: getFeaturesByTier(data.tier)
  });
  
  await org.save();
  return org;
}

function generateLicenseKey() {
  return 'ATT-' + crypto.randomBytes(12).toString('hex').toUpperCase();
}

function getTierLimit(tier) {
  const limits = {
    'startup': 50,
    'business': 250,
    'enterprise': 999999
  };
  return limits[tier];
}

function getFeaturesByTier(tier) {
  const features = {
    'startup': {
      faceRecognition: true,
      qrCodeCheckIn: true,
      leaveManagement: false,
      mobileApp: false,
      reports: false
    },
    'business': {
      faceRecognition: true,
      qrCodeCheckIn: true,
      leaveManagement: true,
      mobileApp: false,
      reports: true
    },
    'enterprise': {
      faceRecognition: true,
      qrCodeCheckIn: true,
      leaveManagement: true,
      mobileApp: true,
      reports: true
    }
  };
  return features[tier];
}

module.exports = { createOrganization, generateLicenseKey };
```

---

## Step 4: Razorpay Integration (Payment Collection)

### 4.1 Install Razorpay SDK
```bash
cd backend
npm install razorpay
```

### 4.2 Create Payment Routes

```javascript
// backend/routes/subscription.js
const express = require('express');
const Razorpay = require('razorpay');
const Organization = require('../models/Organization');

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create subscription
router.post('/create-subscription', async (req, res) => {
  try {
    const { tier, companyName, email } = req.body;
    
    const pricing = {
      'startup': 49900,    // ₹499
      'business': 129900,  // ₹1299
      'enterprise': 299900 // ₹2999
    };
    
    const planDescription = {
      'startup': 'Startup Plan - 50 employees',
      'business': 'Business Plan - 250 employees',
      'enterprise': 'Enterprise Plan - Unlimited'
    };
    
    // Create subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: process.env[`RAZORPAY_PLAN_${tier.toUpperCase()}`],
      customer_notify: 1,
      quantity: 1,
      total_count: 12,
      addons: [
        {
          item: {
            name: planDescription[tier],
            amount: pricing[tier],
            currency: 'INR'
          }
        }
      ],
      notes: {
        companyName,
        tier
      }
    });
    
    // Save to database
    const org = new Organization({
      name: companyName,
      email,
      licenseKey: generateLicenseKey(),
      subscriptionTier: tier,
      razorpaySubscriptionId: subscription.id,
      paymentStatus: 'pending'
    });
    
    await org.save();
    
    res.json({
      subscriptionId: subscription.id,
      licenseKey: org.licenseKey,
      email: org.email
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Payment success webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  
  try {
    const body = req.body.toString();
    
    razorpay.utils.validateWebhookSignature(
      body,
      signature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );
    
    const event = JSON.parse(body);
    
    if (event.event === 'subscription.activated') {
      const subscriptionId = event.payload.subscription.entity.id;
      
      // Update organization
      const org = await Organization.findOneAndUpdate(
        { razorpaySubscriptionId: subscriptionId },
        {
          paymentStatus: 'active',
          subscriptionExpiry: addMonths(new Date(), 1)
        }
      );
      
      console.log(`✅ Subscription activated for ${org.name}`);
    }
    
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
});

function addMonths(date, months) {
  date.setMonth(date.getMonth() + months);
  return date;
}

module.exports = router;
```

---

## Step 5: Update Frontend for SaaS

### 5.1 Add License Key to requests

```javascript
// src/services/api.js
export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL
});

apiClient.interceptors.request.use((config) => {
  const licenseKey = localStorage.getItem('licenseKey');
  if (licenseKey) {
    config.headers['x-license-key'] = licenseKey;
  }
  return config;
});

export default apiClient;
```

### 5.2 Create Login/Registration Flow

```javascript
// src/pages/SaaSLogin.jsx
import { useState } from 'react';

export default function SaaSLogin() {
  const [step, setStep] = useState('login'); // login or register
  const [form, setForm] = useState({});
  
  const handleLogin = async () => {
    // Existing login logic
    localStorage.setItem('licenseKey', form.licenseKey);
  };
  
  const handleRegister = async () => {
    // Register new organization
    const response = await fetch('/api/subscription/create-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tier: form.tier,
        companyName: form.companyName,
        email: form.email
      })
    });
    
    const data = await response.json();
    localStorage.setItem('licenseKey', data.licenseKey);
    // Redirect to payment
    window.location.href = data.paymentLink;
  };
  
  return (
    <div>
      {step === 'login' && (
        <div>
          <h2>Login</h2>
          <input placeholder="License Key" />
          <button onClick={handleLogin}>Login</button>
          <button onClick={() => setStep('register')}>New Client?</button>
        </div>
      )}
      
      {step === 'register' && (
        <div>
          <h2>Subscribe</h2>
          <select onChange={(e) => setForm({...form, tier: e.target.value})}>
            <option value="startup">Startup - ₹499/month</option>
            <option value="business">Business - ₹1299/month</option>
            <option value="enterprise">Enterprise - ₹2999/month</option>
          </select>
          <input placeholder="Company Name" />
          <input placeholder="Email" type="email" />
          <button onClick={handleRegister}>Subscribe</button>
        </div>
      )}
    </div>
  );
}
```

---

## Step 6: Environment Variables

Create `.env` in backend:

```bash
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/attendance-saas

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Firebase (for face recognition)
FIREBASE_API_KEY=xxx
FIREBASE_PROJECT_ID=xxx

# Frontend
REACT_APP_API_URL=https://api.yourattendance.com
```

---

## Step 7: Deployment

### Deploy Backend to DigitalOcean

```bash
# SSH into server
ssh root@your_droplet_ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone your code
git clone https://github.com/yourname/attendance.git
cd attendance/backend

# Install dependencies
npm install

# Create .env file
sudo nano .env
# Paste your environment variables

# Install PM2 for running app
sudo npm install -g pm2

# Start app
pm2 start server.js --name "attendance-backend"
pm2 startup
pm2 save

# Verify it's running
pm2 status
```

### Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd src
vercel
```

### Or use Docker (Recommended)

Your `docker-compose.yml` already exists! Update it:

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID}
      - RAZORPAY_KEY_SECRET=${RAZORPAY_KEY_SECRET}
    volumes:
      - ./backend:/app

  frontend:
    build: ./
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:5000
```

Deploy to DigitalOcean:
```bash
# Copy docker-compose to server
scp docker-compose.yml root@your_droplet_ip:/root/

# SSH in
ssh root@your_droplet_ip

# Start with Docker
docker-compose up -d
```

---

## Step 8: Domain & HTTPS

1. Buy domain: namecheap.com (₹99-500/year)
2. Point to DigitalOcean IP
3. Install SSL:

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d yourdomain.com
```

---

## Step 9: Pricing Page

Create simple pricing page:
```
yourattendance.com/pricing

Startup - ₹499/month
- 50 employees
- Face recognition
- QR check-in
- Email support

Business - ₹1299/month
- 250 employees
- + Leave management
- + Reports
- + Priority support

Enterprise - ₹2999/month
- Unlimited employees
- + Mobile app
- + Customization
- + Dedicated support

30-day free trial (no card required)
```

---

## Revenue Model

| Metric | Value |
|--------|-------|
| Startup clients @ ₹499 | 20 clients = ₹9,980/month |
| Business clients @ ₹1299 | 30 clients = ₹38,970/month |
| Enterprise @ ₹2999 | 5 clients = ₹14,995/month |
| **TOTAL** | **₹63,945/month** = **₹7.67L/year** |

Infrastructure cost: ~₹3,000-5,000/month

**Net profit: ₹60K+/month once you have 50+ clients**

---

## Your Friend's Setup

When your friend signs up:

1. Send Razorpay payment link
2. They pay monthly
3. They get license key
4. They log in and use the system
5. You keep the code, they use it via web

They never get source code - they just access your hosted version.

---

## Support Strategy

| Tier | Support |
|------|---------|
| Startup | Email support, 48hr response |
| Business | Email + Chat, 24hr response |
| Enterprise | Call + Chat + Slack, 4hr response |

Use Crisp.im or Intercom for chat support (~₹500-2000/month)

---

## Checklist to Launch SaaS

- [ ] Update models with organizationId
- [ ] Add organizationMiddleware
- [ ] Create Organization model
- [ ] Integrate Razorpay
- [ ] Create subscription routes
- [ ] Update frontend for SaaS login
- [ ] Set up DigitalOcean server
- [ ] Deploy with Docker
- [ ] Set up domain
- [ ] Install SSL certificate
- [ ] Create pricing page
- [ ] Test payment flow
- [ ] Send to friend for beta test
- [ ] Launch publicly

---

**With this setup, you own the code forever and generate recurring revenue. Your friend pays monthly, you get ₹60K+/month with 50+ clients.**
