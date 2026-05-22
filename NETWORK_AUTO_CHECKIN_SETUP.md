# Network-Based Auto Check-In Setup Guide

This feature automatically detects when employees connect to the office network and prompts them to check in with one tap.

## 🚀 Quick Setup

### Step 1: Configure Network Whitelist in Firestore

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Navigate to **Firestore Database**
3. Create a new collection: `settings`
4. Create a document with ID: `networkWhitelist`
5. Add the following fields:

```
Field Name       | Type      | Value
---------------- | --------- | ------------------
enabled          | boolean   | true
allowedRanges    | array     | (see below)
description      | string    | "Office network whitelist"
lastUpdated      | timestamp | (current time)
```

### Step 2: Add Your Office IP Ranges

In the `allowedRanges` array field, add your office IP addresses. You can use:

**CIDR Notation** (recommended for IP ranges):
- `192.168.1.0/24` - Covers 192.168.1.0 to 192.168.1.255
- `10.0.0.0/16` - Covers 10.0.0.0 to 10.0.255.255
- `172.16.0.0/12` - Covers 172.16.0.0 to 172.31.255.255

**Exact IP** (for specific addresses):
- `203.0.113.45` - Only matches this exact IP

**Example configuration**:
```json
{
  "enabled": true,
  "allowedRanges": [
    "192.168.1.0/24",
    "10.0.0.0/16",
    "203.0.113.45"
  ],
  "description": "Office network whitelist",
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

### Step 3: Find Your Office IP Address

To find your office's external IP address:
1. Visit https://api.ipify.org/ from your office network
2. Note the IP address shown
3. Add it to the `allowedRanges` array

For internal network ranges, check with your IT department.

### Step 4: Update Firestore Security Rules

Add these rules to allow authenticated users to read the whitelist:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Settings collection - admins write, authenticated users read
    match /settings/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## 🎯 How It Works

1. **Network Detection**: When an employee opens the dashboard, the app fetches their public IP address
2. **Validation**: The IP is checked against the `allowedRanges` whitelist using CIDR matching
3. **Prompt Display**: If the IP matches, a slide-up prompt appears: "Auto Check-In Available"
4. **One-Tap Confirmation**: Employee clicks "Confirm Auto Check-In" to mark attendance
5. **Metadata Logging**: The attendance record includes:
   - `ipAddress`: The detected IP
   - `networkVerified`: true
   - `checkInMethod`: 'auto-network'

## 🔒 Security Features

- **IP Validation**: Only whitelisted IPs can trigger auto check-in
- **Whitelist in Firestore**: Centralized configuration, no code changes needed
- **Session Storage**: Dismissal is remembered for the day (prevents repeated prompts)
- **Audit Trail**: Network metadata is logged with each check-in
- **Admin-Only Editing**: Only admin role can modify the whitelist

## 📱 User Experience

**On Office Network**:
1. Employee opens dashboard
2. Prompt appears: "Auto Check-In Available - Connected to office network (192.168.1.45)"
3. Employee clicks "Confirm Auto Check-In"
4. Success toast: "Checked in from office network"

**Outside Office Network**:
- No prompt appears
- Employee uses normal face recognition check-in

**Already Checked In**:
- No prompt appears (even on office network)

## 🛠️ Admin Management (Future Feature)

Create an admin settings page to manage the IP whitelist:

**Features to implement**:
- Add/remove IP ranges with validation
- View current whitelist
- Enable/disable auto check-in
- View check-in logs with network data
- Export attendance reports filtered by check-in method

**UI mockup**:
```jsx
// Admin Settings Page
<div>
  <h2>Network-Based Auto Check-In</h2>
  <Toggle enabled={settings.enabled} onChange={handleToggle} />
  
  <div>
    <h3>Allowed IP Ranges</h3>
    <ul>
      {allowedRanges.map(ip => (
        <li key={ip}>
          {ip} <button onClick={() => removeIP(ip)}>Remove</button>
        </li>
      ))}
    </ul>
    
    <input 
      placeholder="Add IP/CIDR (e.g., 192.168.1.0/24)" 
      value={newIP}
      onChange={(e) => setNewIP(e.target.value)}
    />
    <button onClick={addIP}>Add IP Range</button>
  </div>
</div>
```

## 🧪 Testing

**Test with hardcoded IP** (temporary):
1. Get your current IP: https://api.ipify.org/
2. Add it to Firestore `allowedRanges`
3. Open dashboard
4. Prompt should appear

**Test CIDR matching**:
- IP `192.168.1.45` matches `192.168.1.0/24` ✅
- IP `192.168.2.45` does NOT match `192.168.1.0/24` ❌
- IP `10.0.5.100` matches `10.0.0.0/16` ✅

**Test dismissal behavior**:
1. Click "Not Now" on prompt
2. Refresh page
3. Prompt should NOT appear again today
4. Clear sessionStorage or wait until next day to see prompt again

## ❓ Troubleshooting

**1. Prompt doesn't appear**
- Check that `settings/networkWhitelist` exists in Firestore
- Verify `enabled: true`
- Confirm your IP is in `allowedRanges`
- Check browser console for errors
- Verify you haven't already checked in today

**2. IP detection fails**
- External API might be blocked by firewall
- Check browser console for fetch errors
- Try alternative IP services (api.ipify.org, api.my-ip.io, ipapi.co)

**3. CIDR matching issues**
- Verify CIDR notation is correct (e.g., `192.168.1.0/24`)
- Use an IP calculator to verify range: https://www.ipaddressguide.com/cidr
- For exact IPs, use without `/` (e.g., `203.0.113.45`)

**4. Prompt keeps appearing after dismissal**
- Check sessionStorage in DevTools
- Look for key: `autoCheckInDismissed_2024-01-15`
- If missing, dismissal logic isn't working

## 📊 Database Schema

### Collection: `settings`
**Document ID**: `networkWhitelist`

```typescript
interface NetworkWhitelist {
  enabled: boolean;                // Feature toggle
  allowedRanges: string[];         // Array of IPs/CIDR ranges
  description?: string;            // Optional description
  lastUpdated: string;             // ISO timestamp
  updatedBy?: string;              // User ID who last updated
}
```

### Collection: `attendance`
**Auto check-in records include**:

```typescript
interface AttendanceRecord {
  // ... existing fields
  checkInMethod?: 'auto-network' | 'face-recognition';
  ipAddress?: string;              // Detected IP (only for auto check-in)
  networkVerified?: boolean;       // IP matched whitelist
}
```

## 🔄 Migration Guide

If you already have an attendance system:

1. **No breaking changes** - feature is additive
2. **Existing check-in flows** work unchanged
3. **Old attendance records** don't have network fields (optional fields)
4. **New records** include network metadata only when using auto check-in

## 📝 Next Steps

1. ✅ Set up Firestore document (this guide)
2. ✅ Test with your office IP
3. 🔲 Build admin UI for whitelist management
4. 🔲 Add analytics for auto check-in usage
5. 🔲 Implement location-based check-in (future enhancement)

## 💡 Tips

- **Start with exact IPs** during testing, then expand to CIDR ranges
- **Use private IP ranges** (192.168.x.x, 10.x.x.x) for internal networks
- **Use public IPs** if employees connect through office router
- **Document your IP ranges** with comments in Firestore
- **Review logs regularly** to detect unusual check-in patterns

## 🆘 Support

If you encounter issues:
1. Check browser console for errors
2. Verify Firestore document structure
3. Test IP detection: `validateOfficeNetwork()`
4. Review network tab for API calls
5. Check Firestore security rules

---

**Need help?** Create an issue with:
- Your Firestore document structure
- Browser console errors
- Network tab screenshots
- Expected vs actual behavior
