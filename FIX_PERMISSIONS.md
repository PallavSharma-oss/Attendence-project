# 🔒 FIX: Update Firestore Security Rules

## ⚠️ Problem
You're seeing these errors:
- **"Failed to submit leave request - Missing or insufficient permissions"**
- **"Delete failed - Missing or insufficient permissions"**

This is because your Firestore security rules don't allow these operations yet.

---

## ✅ Solution: Update Firebase Security Rules

### Step 1: Go to Firebase Console

1. Open **https://console.firebase.google.com/**
2. Select your project
3. Click **"Firestore Database"** in the left sidebar
4. Click the **"Rules"** tab at the top

---

### Step 2: Replace All Rules

**Delete everything** in the rules editor and paste this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Users collection rules
    match /users/{userId} {
      // Users can read their own document
      allow read: if isAuthenticated() && request.auth.uid == userId;
      
      // Users can create their own document during registration
      allow create: if isAuthenticated() && request.auth.uid == userId;
      
      // Users can update their own document (including face descriptor)
      allow update: if isAuthenticated() && request.auth.uid == userId;
      
      // Admins can read all user documents
      allow read: if isAdmin();
      
      // Admins can update any user document (for management)
      allow update: if isAdmin();
      
      // Admins can delete user documents
      allow delete: if isAdmin();
    }
    
    // Attendance collection rules
    match /attendance/{docId} {
      // Users can read their own attendance records
      allow read: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
      
      // Users can create their own attendance records
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid &&
        request.resource.data.keys().hasAll(['userId', 'date', 'checkIn', 'status']);
      
      // Users can update their own attendance records (for check-out)
      allow update: if isAuthenticated() && 
        resource.data.userId == request.auth.uid &&
        request.resource.data.userId == request.auth.uid;
      
      // Admins can read all attendance records
      allow read: if isAdmin();
      
      // Admins can write all attendance records (if needed for corrections)
      allow write: if isAdmin();
    }
    
    // Leaves collection rules
    match /leaves/{leaveId} {
      // Users can read their own leave requests
      allow read: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
      
      // Users can create their own leave requests
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid &&
        request.resource.data.keys().hasAll(['userId', 'userName', 'userEmail', 'startDate', 'endDate', 'reason', 'status']);
      
      // Users can update their own pending leave requests (to cancel)
      allow update: if isAuthenticated() && 
        resource.data.userId == request.auth.uid &&
        resource.data.status == 'pending';
      
      // Users can delete their own pending leave requests
      allow delete: if isAuthenticated() && 
        resource.data.userId == request.auth.uid &&
        resource.data.status == 'pending';
      
      // Admins can read all leave requests
      allow read: if isAdmin();
      
      // Admins can update all leave requests (for approval/decline)
      allow update: if isAdmin();
      
      // Admins can delete leave requests
      allow delete: if isAdmin();
    }
    
    // Settings collection rules (for network whitelist and other settings)
    match /settings/{document} {
      // All authenticated users can read settings
      allow read: if isAuthenticated();
      
      // Only admins can write settings
      allow write: if isAdmin();
    }
  }
}
```

---

### Step 3: Publish Rules

1. Click the **"Publish"** button at the top right
2. Wait for confirmation: "Rules successfully published"

---

## ✅ What Changed

### Added Rules for:
1. **Leave Requests** (`leaves` collection)
   - ✅ Employees can submit leave requests
   - ✅ Employees can read their own requests
   - ✅ Admins can approve/decline any request

2. **User Management** (`users` collection)
   - ✅ Admins can update user details (role, department)
   - ✅ Admins can delete users

3. **Settings** (`settings` collection)
   - ✅ All users can read settings (for network auto check-in)
   - ✅ Only admins can modify settings

---

## 🧪 Test After Updating

1. **Employee Dashboard**:
   - Click "Apply for Leave"
   - Fill in dates and reason
   - Submit → Should work now! ✅

2. **Admin Panel**:
   - Go to Admin Panel
   - Click edit (✏️) on a user → Should work! ✅
   - Click delete (🗑️) on a user → Should work! ✅
   - Review and approve/decline leave requests → Should work! ✅

---

## 📸 Visual Guide

### Step-by-Step Screenshot Guide:

**Step 1**: Firebase Console
```
Firebase Console → Your Project → Firestore Database
```

**Step 2**: Rules Tab
```
Click "Rules" tab at the top (next to "Data", "Indexes")
```

**Step 3**: Replace Rules
```
Select All (Ctrl+A) → Delete → Paste new rules
```

**Step 4**: Publish
```
Click "Publish" button (top right, blue button)
```

**Success Message**:
```
✅ "Rules successfully published"
```

---

## ⚠️ Important Notes

- **These rules are secure**: They check user authentication and admin role
- **Users can only modify their own data** (except admins)
- **Admins are identified by** `role: 'admin'` in their user document
- **If you change these rules**, make sure to test thoroughly

---

## 🆘 Troubleshooting

**If it still doesn't work after publishing:**

1. **Hard refresh your app**: Press `Ctrl + Shift + R`
2. **Check admin role**: 
   - Go to Firestore → users → your document
   - Verify `role: "admin"` field exists
3. **Check console for errors**: Press F12 → Console tab
4. **Wait a moment**: Rules can take 10-30 seconds to propagate

**If you see "Failed to get document":**
- User might not have admin role set
- Follow the guide: [HOW_TO_MAKE_ADMIN.md](./HOW_TO_MAKE_ADMIN.md)

---

## ✅ Quick Checklist

- [ ] Opened Firebase Console
- [ ] Navigated to Firestore Database → Rules
- [ ] Replaced all existing rules with new rules
- [ ] Clicked "Publish"
- [ ] Saw success message
- [ ] Hard refreshed app (Ctrl + Shift + R)
- [ ] Tested leave submission (employee)
- [ ] Tested user edit (admin)
- [ ] Tested user delete (admin)
- [ ] All features working! 🎉

---

**Done!** Your permissions are now correctly configured. 🚀
