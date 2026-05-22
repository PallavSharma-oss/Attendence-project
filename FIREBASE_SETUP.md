# Firebase Setup Instructions

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: "attendance-management-system"
4. Follow the setup wizard

## Step 2: Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Save changes

## Step 3: Create Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode"
4. Select your preferred location
5. Click "Enable"

## Step 4: Set Up Security Rules

1. Go to "Firestore Database" > "Rules" tab
2. Copy the contents from `firestore.rules` file
3. Paste into the rules editor
4. Click "Publish"

## Step 5: Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click on "</>" (Web app icon)
4. Register your app with a nickname
5. Copy the configuration object

## Step 6: Configure Environment Variables

1. Create a `.env` file in the project root
2. Add your Firebase configuration:

```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

## Step 7: Create Test Users

After starting the app, register users with:

**Admin User:**
- Email: admin@company.com
- Password: admin123
- Role: Admin
- Department: Management

**Employee User:**
- Email: employee@company.com
- Password: employee123
- Role: Employee
- Department: Engineering

## Step 8: Test the Application

1. Login with employee account
2. Check in and verify status
3. Check out and verify work hours
4. View attendance history
5. Login with admin account
6. Access admin panel
7. View all employees and attendance

## Optional: Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Select your project
# Set public directory to: dist
# Configure as single-page app: Yes
npm run build
firebase deploy
```

Your app will be live at: `https://your-project.web.app`

## Firestore Indexes (if needed)

If you get errors about missing indexes, Firebase will provide a link to create them automatically. Just click the link and wait for the indexes to build.

## Monitoring and Analytics (Optional)

1. Enable Google Analytics in Firebase
2. Go to Analytics > Dashboard
3. Monitor user activity, performance, and errors

---

That's it! Your Attendance Management System is ready to use. 🎉
