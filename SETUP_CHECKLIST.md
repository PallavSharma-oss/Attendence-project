# ✅ Network Auto Check-In Setup Checklist

Use this checklist to set up and test the network-based automatic check-in feature.

---

## 📋 Prerequisites

- [ ] Firebase project is set up and running
- [ ] Attendance app is deployed and accessible
- [ ] You have admin access to Firebase Console
- [ ] You know your office network's IP address

---

## 🚀 Setup Steps

### Step 1: Get Your Office IP Address
- [ ] Visit https://api.ipify.org/ from your office network
- [ ] Copy the IP address displayed
- [ ] Write it down: `_______________________`

> **Note**: If you have multiple office locations, repeat this for each location.

### Step 2: Create Firestore Document
- [ ] Open Firebase Console: https://console.firebase.google.com/
- [ ] Select your project
- [ ] Go to **Firestore Database** (left sidebar)
- [ ] Click **+ Start collection** (top)
- [ ] Enter Collection ID: `settings`
- [ ] Click **Next**
- [ ] Enter Document ID: `networkWhitelist`
- [ ] Click **Add field** and create these fields:

| Field Name | Type | Value |
|------------|------|-------|
| `enabled` | boolean | ✅ true |
| `allowedRanges` | array | [Click "Add item" and paste your IP from Step 1] |
| `description` | string | Office network whitelist |
| `lastUpdated` | timestamp | [Click "Current timestamp"] |

- [ ] Click **Save**

### Step 3: Verify Document Structure
Your Firestore should now look like this:
```
📁 Firestore Database
  └─ 📁 settings (collection)
      └─ 📄 networkWhitelist (document)
          ├─ enabled: true
          ├─ allowedRanges: ["203.0.113.45"]  ← Your IP here
          ├─ description: "Office network whitelist"
          └─ lastUpdated: December 15, 2024 at 10:30:00 AM
```

- [ ] All fields are present
- [ ] `enabled` is set to `true` (not false)
- [ ] `allowedRanges` is an array (not a string)
- [ ] Your IP is in the `allowedRanges` array

---

## 🧪 Testing

### Test 1: Basic IP Detection
- [ ] Open `network-test.html` in your browser (included in project)
- [ ] Click "Detect My IP Address"
- [ ] Verify your IP is detected correctly
- [ ] IP matches what you added to Firestore

### Test 2: Validation Logic
- [ ] In `network-test.html`, scroll to Test 2
- [ ] Enter your IP in "Test IP Address" field
- [ ] Enter your IP in "Allowed IP Ranges" textarea
- [ ] Click "Test Validation"
- [ ] Verify result shows "✅ ALLOWED"

### Test 3: Full Network Check
- [ ] In `network-test.html`, scroll to Test 3
- [ ] Click "Run Full Network Check"
- [ ] Wait for detection and validation
- [ ] Verify result shows "✅ Auto Check-In Would Be Available!"

### Test 4: App Integration
- [ ] Open your attendance app
- [ ] Log in as an employee (not admin)
- [ ] Navigate to Dashboard
- [ ] **Verify prompt appears**: "Auto Check-In Available"
- [ ] **Verify IP is shown**: Should match your actual IP
- [ ] Click "Confirm Auto Check-In"
- [ ] **Verify success toast**: "Checked in from office network (your-ip)"

### Test 5: Check Attendance Record
- [ ] Go to Firebase Console → Firestore Database
- [ ] Navigate to `attendance` collection
- [ ] Find today's attendance record
- [ ] Verify these fields exist:
  - [ ] `checkInMethod: "auto-network"`
  - [ ] `ipAddress: "your-ip"`
  - [ ] `networkVerified: true`

### Test 6: Dismissal Behavior
- [ ] Refresh Dashboard (or log out and log back in)
- [ ] Click "Not Now" on the prompt
- [ ] Refresh page again
- [ ] **Verify prompt does NOT appear** (dismissed for today)

### Test 7: Already Checked In
- [ ] Complete Test 4 (check in via auto check-in)
- [ ] Refresh Dashboard
- [ ] **Verify prompt does NOT appear** (already checked in)

### Test 8: Outside Office Network
This test requires changing your network or using a different IP:
- [ ] Change IP in Firestore to a different value (e.g., "192.168.99.99")
- [ ] Refresh Dashboard
- [ ] **Verify prompt does NOT appear** (IP not in whitelist)
- [ ] Change IP back to correct value
- [ ] Verify prompt appears again

---

## 🔧 Troubleshooting

### Prompt Not Appearing?

#### Check 1: Console Errors
- [ ] Open browser DevTools (F12)
- [ ] Go to Console tab
- [ ] Look for errors related to network detection
- [ ] Common errors:
  - "Failed to fetch from..." → IP service blocked
  - "Network whitelist not configured" → Firestore document missing
  - "settings/networkWhitelist doesn't exist" → Wrong document path

#### Check 2: Verify Firestore Document
- [ ] Firestore has `settings` collection
- [ ] Collection has `networkWhitelist` document
- [ ] Document has `enabled: true` (not false)
- [ ] `allowedRanges` is an array (not empty)
- [ ] Your IP is in the array

#### Check 3: Verify IP Detection
- [ ] Open DevTools → Network tab
- [ ] Refresh Dashboard
- [ ] Look for requests to:
  - `api.ipify.org`
  - `api.my-ip.io`
  - `ipapi.co`
- [ ] Check if any succeeded (Status 200)
- [ ] If all fail, firewall may be blocking

#### Check 4: Check Authentication
- [ ] User is logged in
- [ ] User has valid session
- [ ] Try logging out and back in

#### Check 5: Clear Session Storage
- [ ] Open DevTools → Application tab
- [ ] Go to Session Storage
- [ ] Look for key starting with `autoCheckInDismissed_`
- [ ] Delete it
- [ ] Refresh page

### IP Detection Fails?

**Solution 1: Check Firewall**
- [ ] Ask IT if external API calls are blocked
- [ ] Try accessing https://api.ipify.org/ directly in browser
- [ ] If blocked, ask IT to whitelist these domains:
  - api.ipify.org
  - api.my-ip.io
  - ipapi.co

**Solution 2: Test Alternative Services**
- [ ] Try each IP service manually:
  - https://api.ipify.org?format=json
  - https://api.my-ip.io/v1/ip.json
  - https://ipapi.co/json/
- [ ] Note which ones work
- [ ] Update `networkDetection.js` if needed

### Wrong IP Detected?

**Situation**: App detects wrong IP (e.g., VPN IP instead of office IP)

- [ ] Confirm your actual public IP: https://api.ipify.org/
- [ ] Check if you're connected to VPN
- [ ] Check if proxy is configured
- [ ] Add VPN exit IP to whitelist if needed

### CIDR Range Not Working?

**Example**: IP `192.168.1.45` should match `192.168.1.0/24` but doesn't

**Check**:
- [ ] CIDR notation is correct (format: `network/prefix`)
- [ ] Prefix is valid (0-32)
- [ ] Use CIDR calculator to verify: https://www.ipaddressguide.com/cidr
- [ ] Test in `network-test.html` first

---

## 📊 Success Criteria

✅ **Feature is working correctly if:**

1. [ ] Prompt appears when on office network
2. [ ] Prompt shows correct IP address
3. [ ] Clicking "Confirm" checks in successfully
4. [ ] Attendance record has network metadata
5. [ ] Prompt doesn't appear when already checked in
6. [ ] Prompt doesn't appear outside office network
7. [ ] Dismissal prevents re-showing today

---

## 🎯 Next Steps

Once basic feature is working:

### Enhance Security
- [ ] Add more office IPs/ranges (if multiple locations)
- [ ] Set up admin UI for whitelist management
- [ ] Enable Firestore security rules
- [ ] Set up email alerts for unusual IPs

### Monitor Usage
- [ ] Check how many employees use auto check-in
- [ ] Review IPs in attendance records
- [ ] Identify any unusual check-in patterns

### Documentation
- [ ] Share setup guide with team
- [ ] Document your IP ranges
- [ ] Create admin guide for whitelist management

---

## 📞 Getting Help

If you're stuck:

1. **Check Documentation**
   - [ ] Read [QUICK_START_NETWORK_CHECKIN.md](./QUICK_START_NETWORK_CHECKIN.md)
   - [ ] Review [NETWORK_AUTO_CHECKIN_SETUP.md](./NETWORK_AUTO_CHECKIN_SETUP.md)
   - [ ] Check [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

2. **Use Test Tool**
   - [ ] Open `network-test.html`
   - [ ] Run all tests
   - [ ] Note which tests fail

3. **Check Logs**
   - [ ] Browser console (F12 → Console)
   - [ ] Network tab (F12 → Network)
   - [ ] Firestore logs

4. **Verify Configuration**
   - [ ] Firestore document structure
   - [ ] IP format (CIDR vs exact)
   - [ ] Feature enabled flag

---

## 🎉 Completion

Once all tests pass, your network-based auto check-in is ready!

**Final Checklist**:
- [ ] All setup steps completed
- [ ] All tests passing
- [ ] Documentation reviewed
- [ ] Team informed about new feature
- [ ] Monitoring in place

**Date Completed**: _______________

**Configured By**: _______________

**Office IPs Added**: _______________

---

**Remember**: You can always update IPs in Firestore without code changes!

Go to: Firebase Console → Firestore → settings → networkWhitelist → allowedRanges → Edit
