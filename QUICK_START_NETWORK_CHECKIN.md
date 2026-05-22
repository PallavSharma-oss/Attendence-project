# Quick Start: Set Up Network Auto Check-In

## 🎯 5-Minute Setup

### Step 1: Find Your Office IP
Visit this URL from your office network:
```
https://api.ipify.org/
```
Copy the IP address shown (e.g., `203.0.113.45`)

### Step 2: Create Firestore Document

1. Open Firebase Console: https://console.firebase.google.com/
2. Select your project
3. Go to **Firestore Database**
4. Click **+ Start collection**
5. Collection ID: `settings`
6. Click **Next**
7. Document ID: `networkWhitelist`
8. Add these fields:

| Field Name      | Type      | Value                                    |
|-----------------|-----------|------------------------------------------|
| `enabled`       | boolean   | ✅ true                                  |
| `allowedRanges` | array     | Add your IP from Step 1                  |
| `description`   | string    | "Office network whitelist"               |
| `lastUpdated`   | timestamp | Click "Current timestamp"                |

**Example `allowedRanges` values:**
- `203.0.113.45` (exact IP - use your IP from Step 1)
- `192.168.1.0/24` (office LAN range)
- `10.0.0.0/16` (private network)

### Step 3: Test

1. Open your attendance app
2. Go to Dashboard
3. You should see: **"Auto Check-In Available"** prompt
4. Click **"Confirm Auto Check-In"**
5. Done! ✅

---

## 📋 Visual Guide

### Firestore Document Structure
```
📁 settings (collection)
  └── 📄 networkWhitelist (document)
       ├── enabled: true
       ├── allowedRanges: ["203.0.113.45", "192.168.1.0/24"]
       ├── description: "Office network whitelist"
       └── lastUpdated: December 15, 2024 at 10:30:00 AM UTC
```

### Screenshot Checklist
When creating the document, your screen should look like:

```
Collection ID:  settings          [Auto-ID | Custom ID: ✓]
Document ID:    networkWhitelist

Field          Type       Value
─────────────────────────────────────────────────────
enabled        boolean    ☑ true
allowedRanges  array      ["203.0.113.45"]
description    string     Office network whitelist
lastUpdated    timestamp  Dec 15, 2024, 10:30:00 AM
─────────────────────────────────────────────────────
                          [Cancel]  [Save]
```

---

## 🧪 Testing Different Scenarios

### Test 1: On Office Network
**Expected**: Prompt appears "Auto Check-In Available"
**Action**: Click "Confirm Auto Check-In"
**Result**: Success toast "Checked in from office network"

### Test 2: Outside Office
**Expected**: No prompt appears
**Action**: Use normal face recognition check-in
**Result**: Standard check-in flow

### Test 3: Already Checked In
**Expected**: No prompt (even on office network)
**Reason**: Already marked attendance for today

### Test 4: Dismissed Prompt
**Expected**: Prompt doesn't appear again today
**Action**: Click "Not Now"
**Result**: Won't show until next day

---

## 🔧 Common Issues

### Prompt Not Appearing?

**1. Check Console Logs**
Open browser DevTools (F12) → Console tab
Look for: `"Office network detected"` or errors

**2. Verify IP**
```javascript
// Paste in console to check your IP:
fetch('https://api.ipify.org?format=json')
  .then(r => r.json())
  .then(console.log)
```

**3. Verify Firestore Document**
- Collection: `settings`
- Document: `networkWhitelist`
- Field `enabled`: must be `true`
- Field `allowedRanges`: array must contain your IP

**4. Clear Session Storage**
```javascript
// Paste in console to clear dismissal:
sessionStorage.clear()
location.reload()
```

---

## 📝 Adding More IPs

To allow check-in from multiple locations:

1. Go to Firestore → `settings/networkWhitelist`
2. Click `allowedRanges` field
3. Add new array items:

```
allowedRanges: [
  "203.0.113.45",      // Main office
  "198.51.100.20",     // Branch office
  "192.168.1.0/24",    // Office LAN
  "10.0.0.0/16"        // Corporate VPN
]
```

---

## 🎨 What Users See

### On Office Network:
```
┌─────────────────────────────────────────────┐
│  🛜  Office Network Detected           ✕   │
│     Auto check-in is available              │
├─────────────────────────────────────────────┤
│                                             │
│  ✓ Verified office location                │
│    IP: 203.0.113.45                         │
│                                             │
│  [    ✓ Confirm Auto Check-In    ]         │
│                                             │
│  [        Not Now        ]                  │
│                                             │
└─────────────────────────────────────────────┘
```

### Success:
```
✅ Auto check-in successful
   Checked in from office network (203.0.113.45)
```

---

## 🔐 Security Features

✅ **IP Whitelisting**: Only approved IPs can auto check-in
✅ **Centralized Control**: Managed in Firestore (no code changes)
✅ **Audit Trail**: Every check-in logs IP address
✅ **Session Memory**: Dismissal remembered for the day
✅ **No Remote Abuse**: Works only from office network

---

## 🚀 Next Steps

After basic setup:

1. **Add More Locations**: Include branch offices, VPN ranges
2. **Monitor Usage**: Check attendance records for `checkInMethod: 'auto-network'`
3. **Build Admin UI**: Let managers update IP ranges without accessing Firestore
4. **Set Up Alerts**: Get notified of check-ins from unusual IPs

---

## 💡 Pro Tips

- **Start with exact IP** during testing
- **Expand to CIDR ranges** after confirming it works
- **Document your IPs** in the `description` field
- **Use private ranges** (192.168.x.x) for internal LANs
- **Add VPN ranges** if employees use VPN from home

---

**Need Help?**
Check the full guide: [NETWORK_AUTO_CHECKIN_SETUP.md](./NETWORK_AUTO_CHECKIN_SETUP.md)
