# How to Change User Role to Admin

Since users can only register as employees, you need to manually promote users to admin from Firebase Console.

## Steps to Make a User Admin:

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: `attendance-f7870`

2. **Navigate to Firestore Database**
   - Click on "Firestore Database" in the left sidebar
   - You'll see two collections: `users` and `attendance`

3. **Find the User**
   - Click on the `users` collection
   - Find the user document you want to promote (identified by their UID)
   - Click on the document

4. **Edit the Role Field**
   - Find the `role` field (should show `employee`)
   - Click on the field value
   - Change `employee` to `admin`
   - Click outside or press Enter to save

5. **Verify Changes**
   - The user needs to log out and log back in
   - After login, they'll have access to the Admin Panel

## Quick Access:
Direct link to your Firestore Database:
https://console.firebase.google.com/project/attendance-f7870/firestore

---

## ✅ Changes Made:
- ✅ Role selection removed from registration page
- ✅ All new users register as "employee" by default
- ✅ Only you (via Firebase Console) can promote users to admin
- ✅ This provides better security and control

## 🔐 Security Benefits:
- Users cannot self-promote to admin
- You maintain full control over who has admin access
- Prevents unauthorized admin access
- More secure for production environments
