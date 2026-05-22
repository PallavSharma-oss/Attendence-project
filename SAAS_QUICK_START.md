# SaaS Launch Checklist - Quick Start

## Week 1: Code Preparation

### Backend Updates
- [ ] Add `organizationId` field to ALL models (User, Attendance, Leave, Office, etc)
- [ ] Create Organization model
- [ ] Create organizationMiddleware - auto-injects organizationId
- [ ] Update ALL routes to filter by organizationId
- [ ] Create licensing manager (generate keys, validate subscriptions)

**Time: 2-3 hours**

Quick test: Manually add organizationId to Attendance model and test query filtering

---

## Week 1: Payment Integration

- [ ] Create Razorpay account (razorpay.com)
- [ ] Get API keys (Key ID + Secret)
- [ ] Install Razorpay SDK: `npm install razorpay`
- [ ] Create subscription routes (/api/subscription/create-subscription, /webhook)
- [ ] Test payment webhook locally with ngrok

**Time: 2-3 hours**

```bash
# Test webhook locally
npm install -g ngrok
ngrok http 5000
# Use ngrok URL in Razorpay dashboard
```

---

## Week 2: Frontend Updates

- [ ] Update API client to send license key in headers
- [ ] Create SaaSLogin.jsx page (login vs register flow)
- [ ] Add registration form (company name, email, tier selection)
- [ ] Add payment success page
- [ ] Update navigation to show current tier/subscription

**Time: 2-3 hours**

---

## Week 2: Deployment

### Option A: DigitalOcean (Recommended)
- [ ] Create DigitalOcean account
- [ ] Create 2GB Droplet (₹150/month)
- [ ] SSH and install Node.js + Docker
- [ ] Clone repository to server
- [ ] Copy docker-compose.yml and deploy
- [ ] Set up PM2 or systemd for auto-restart

**Time: 1 hour**

### Option B: Docker Compose (Local Testing)
```bash
docker-compose up -d
```

**Time: 15 minutes for testing**

---

## Week 3: Domain & SSL

- [ ] Buy domain (namecheap.com, ₹99-500/year)
- [ ] Update DigitalOcean DNS
- [ ] Install Let's Encrypt SSL certificate
- [ ] Update REACT_APP_API_URL to production domain

**Time: 1 hour**

---

## Week 3: Testing

- [ ] Test multi-tenancy (create 2 test organizations, verify data isolation)
- [ ] Test payment flow (use Razorpay test cards)
- [ ] Test subscription webhook
- [ ] Test license key validation
- [ ] Test permission checks (org A can't see org B data)

**Time: 2 hours**

---

## For Your Friend

### Send Them This:

**Email Template:**
```
Subject: Attendance System - SaaS Access

Hi [Name],

I've built an enterprise attendance system with face recognition, 
QR check-in, and reporting. It's now available as a service!

Pricing:
- Startup: ₹499/month (50 employees)
- Business: ₹1299/month (250 employees)
- Enterprise: ₹2999/month (Unlimited)

30-day free trial available.

Register here: https://yourattendance.com

What you get:
✅ Face recognition check-in
✅ QR code check-in
✅ Leave management
✅ Admin dashboard
✅ 24/7 uptime
✅ Automatic backups
✅ Email support

Let me know if you want a demo!

Best,
[Your Name]
```

---

## Timeline

| Week | Task | Status |
|------|------|--------|
| Week 1 | Code updates + Razorpay integration | ⏳ |
| Week 2 | Frontend + Deployment | ⏳ |
| Week 3 | Domain + Testing | ⏳ |
| Week 4 | Launch | 🚀 |

---

## Cost Breakdown

| Item | Cost | Duration |
|------|------|----------|
| DigitalOcean Server | ₹150 | /month |
| Domain | ₹250 | /year (₹20/month) |
| Razorpay fees | 2% | Per transaction |
| SSL (Let's Encrypt) | FREE | - |
| **Total** | **₹170/month** | - |

**Breakeven**: ~1 Startup client covers all costs

---

## Revenue After Launch

| # Clients | @ ₹499 | @ ₹1299 | @ ₹2999 | Total/month |
|-----------|--------|---------|---------|------------|
| 10 + 10 + 2 | ₹4,990 | ₹12,990 | ₹5,998 | ₹23,978 |
| 20 + 20 + 3 | ₹9,980 | ₹25,980 | ₹8,997 | ₹44,957 |
| 30 + 30 + 5 | ₹14,970 | ₹38,970 | ₹14,995 | ₹68,935 |

**Less operating costs (-₹5,000/month maintenance) = ₹63,935/month profit with 55 clients**

---

## Common Issues & Fixes

### Issue: License key not working
**Fix**: Ensure organizationMiddleware is applied to all routes
```javascript
router.get('/attendance', organizationMiddleware, getAllAttendance);
```

### Issue: Data leaks between organizations
**Fix**: Always filter by organizationId
```javascript
// ❌ WRONG
const records = await Attendance.find();

// ✅ RIGHT
const records = await Attendance.find({ organizationId: req.organizationId });
```

### Issue: Webhook not validating
**Fix**: Ensure raw body for webhook endpoint
```javascript
router.post('/webhook', express.raw({type: 'application/json'}), handler);
```

---

## Important Security Notes

1. **Never expose organizationId in frontend**
   - Always get it from authenticated middleware
   
2. **Validate license key on every request**
   - Don't trust client headers

3. **Don't share API keys**
   - Use .env, never commit them

4. **Encrypt sensitive data**
   - Face descriptors, payment info, etc.

---

## Success Metrics

Track these metrics:
- Total subscriptions
- Monthly recurring revenue (MRR)
- Churn rate (% of clients who cancel)
- Customer acquisition cost (CAC)
- Lifetime value (LTV)

Update dashboard monthly to check growth!

---

## Next Step

Choose one task from Week 1 and start TODAY. 

**Recommended start**: Add organizationId to backend models (easiest, foundation for everything)

```javascript
// backend/models/User.js - ADD THIS LINE:
organizationId: String,
```

Then test it works. Then move to next task.

**You've got this! 🚀**
