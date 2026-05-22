# How to Set Up Paid Licensing

This guide helps you implement a paid licensing system for your attendance project.

## Quick Setup Checklist

### ✅ Phase 1: Protect Your Code (Do This First)
- [x] Add LICENSE file ✓
- [x] Add PAYMENT_TERMS.md ✓
- [x] Update package.json with copyright ✓
- [ ] Store in private Git repository (GitHub Private / GitLab)
- [ ] Remove sensitive keys (.env, firebase-key.json)
- [ ] Add copyright headers to sensitive files

### ✅ Phase 2: Create Payment Infrastructure
- [ ] Set up Razorpay account (for Indian clients)
- [ ] Create invoice template
- [ ] Set up email for license key delivery
- [ ] Create simple landing page
- [ ] Document pricing tiers

### ✅ Phase 3: License Key System
- [ ] Generate unique license keys per client
- [ ] Add license validation to backend
- [ ] Limit features based on license tier
- [ ] Track license expiry
- [ ] Implement license activation flow

### ✅ Phase 4: Deployment
- [ ] Deploy backend to cloud (AWS/DigitalOcean)
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Set up HTTPS/SSL
- [ ] Create client onboarding guide
- [ ] Create support documentation

---

## Step 1: Private Git Repository

**GitHub Setup:**
1. Create private repository
2. Add this to README:
```markdown
# Attendance Management System - Proprietary

This is licensed software. Unauthorized access is prohibited.

For licensing inquiries, contact: [your-email]

**See PAYMENT_TERMS.md for licensing options.**
```

3. Don't share credentials with friend - sell them a license instead

---

## Step 2: Generate License Keys

Create a simple license key generator:

```javascript
// backend/utils/licensingManager.js

const crypto = require('crypto');

function generateLicenseKey(clientName, tier = 'business', durationMonths = 12) {
  const timestamp = Date.now();
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
  
  // Format: YYYYMMDD-TIER-CLIENTS-HASH
  const dateStr = Math.floor(timestamp / 1000).toString(16).toUpperCase();
  const tierCode = tier.substring(0, 3).toUpperCase();
  const hash = crypto.randomBytes(8).toString('hex').toUpperCase();
  
  const licenseKey = `${dateStr}-${tierCode}-${hash}`;
  
  return {
    licenseKey,
    clientName,
    tier,
    issuedDate: new Date(timestamp),
    expiryDate,
    durationMonths,
    status: 'active'
  };
}

module.exports = { generateLicenseKey };
```

---

## Step 3: Validate License in Backend

```javascript
// backend/middleware/licensingMiddleware.js

const activeLicenses = {
  // You'll store this in MongoDB/Firestore
  // Format: licenseKey => { clientId, tier, expiryDate, maxUsers }
};

function validateLicense(req, res, next) {
  const licenseKey = req.headers['x-license-key'];
  
  if (!licenseKey) {
    return res.status(403).json({ error: 'License key required' });
  }
  
  const license = activeLicenses[licenseKey];
  
  if (!license) {
    return res.status(403).json({ error: 'Invalid license key' });
  }
  
  if (new Date() > new Date(license.expiryDate)) {
    return res.status(403).json({ error: 'License expired' });
  }
  
  req.license = license;
  next();
}

module.exports = { validateLicense };
```

---

## Step 4: Pricing Structure

Create a PRICING.md file:

```markdown
# Pricing

## Cloud SaaS (Recommended)

### Startup - ₹499/month
- Up to 50 employees
- Basic features
- Email support

### Business - ₹1,299/month
- Up to 250 employees
- All features
- Priority support

### Enterprise - Custom
- Unlimited employees
- Custom features
- Dedicated support

**Annual billing**: 15% discount
**Free trial**: 7 days

## Self-Hosted License

### Single Organization - ₹75,000 (one-time)
- 1 year support included
- Source code access
- Deploy on own servers
- Up to 500 employees

### Enterprise - ₹2,00,000+ (one-time)
- Unlimited employees
- 3 years support
- Full customization
- Priority support
```

---

## Step 5: Create Invoice & Payment Flow

**Invoice Template:**
```
INVOICE

Bill To: [Company Name]
Date: [Date]
Invoice #: [INV-001-2026]
License Key: [GENERATED-KEY]

Description: Attendance System License - [TIER] Plan
Duration: [1 year / Perpetual]
Amount: ₹[Amount]

Payment Method: UPI/Razorpay Link
Due Date: [Date]

License activates upon payment.

Terms: See PAYMENT_TERMS.md
```

---

## Step 6: Sharing With Your Friend

**Option A: Share as Licensed Client**
1. Generate license key for them
2. Create invoice
3. Charge them (₹75,000 - ₹1,00,000 for single org)
4. Give source code access via private repo
5. Provide setup documentation

**Option B: Share SaaS Access (Rent)**
1. Deploy on cloud server
2. Create their organization account
3. Charge monthly (₹1,000-2,000)
4. You handle updates and maintenance

---

## Practical Example: Selling to Your Friend

1. **Send invoice:**
   ```
   Attendance System License
   Organization: [Their Company]
   Tier: Business
   Price: ₹75,000
   Duration: 1 year
   ```

2. **Upon payment:**
   ```
   Send via email:
   - License key
   - GitHub private repo link
   - Setup documentation
   - Your contact for support
   ```

3. **They get:**
   - Full source code
   - Can deploy on their own server
   - 1 year email support
   - Can customize for their needs

---

## Tools You'll Need

1. **Razorpay**: Payment collection (razorpay.com)
2. **GitHub**: Code hosting (github.com)
3. **Vercel**: Frontend hosting (vercel.com)
4. **AWS/DigitalOcean**: Backend hosting (~₹2000-5000/month)
5. **Airtable/Notion**: Track licenses

---

## Revenue Projections

**Scenario 1: SaaS Model**
- 50 clients @ ₹1000/month = ₹50,000/month
- Annual revenue = ₹6,00,000

**Scenario 2: License Model**
- 10 organizations @ ₹75,000 = ₹7,50,000 (one-time)
- 5 enterprises @ ₹2,00,000 = ₹10,00,000 (one-time)

**Best Path**: Start with SaaS (recurring revenue)

---

## Do NOT Do
❌ Give away for free
❌ Share on GitHub public (unless you want free replicas)
❌ Share without clear payment terms
❌ Deploy for them without getting paid
❌ Forget to backup your code

## DO Do
✅ Store in private repository
✅ Create clear license
✅ Have written agreement with friend
✅ Generate license keys for each client
✅ Keep audit of who has what
✅ Update software regularly for SaaS clients
