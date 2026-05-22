# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies (1 minute)
```bash
npm install
```

### Step 2: Set Up Firebase (2 minutes)

1. **Create Firebase Project:**
   - Visit: https://console.firebase.google.com/
   - Click "Add project"
   - Name it "attendance-system"

2. **Enable Authentication:**
   - Go to Authentication → Sign-in method
   - Enable "Email/Password"

3. **Create Firestore Database:**
   - Go to Firestore Database
   - Click "Create database"
   - Choose "Start in production mode"

4. **Get Configuration:**
   - Go to Project Settings (⚙️)
   - Scroll to "Your apps"
   - Click Web icon (</>)
   - Copy the config values

### Step 3: Configure Environment (1 minute)

Create a `.env` file in the root directory:

```bash
# Create .env file
cp .env.example .env
```

Then fill in your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Step 4: Set Firestore Rules (1 minute)

In Firebase Console:
1. Go to Firestore Database → Rules
2. Copy content from `firestore.rules` file
3. Paste and click "Publish"

### Step 5: Run the App! 🎉
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## 📝 Test the System

### Register Your First User:

1. Go to `/register`
2. Fill in the form:
   - Name: John Doe
   - Email: john@company.com
   - Password: john123
   - Department: Engineering
   - Role: Employee

3. Click Register

### Test Check-In/Out:

1. Click "Check In" button
2. Wait a moment
3. Click "Check Out" button
4. View your attendance in History page

### Create an Admin User:

1. Logout
2. Register another user with Role: Admin
3. Login with admin credentials
4. Access Admin Panel to see all data

## 🎯 Key Features to Test

✅ **Employee Dashboard:**
- Real-time clock
- Check-in before 9:30 AM (Present status)
- Check-in after 9:30 AM (Late status)
- Check-out functionality
- View today's status

✅ **Attendance History:**
- View personal attendance
- Filter by month
- See work hours calculation

✅ **Admin Panel:**
- View all employees
- Monitor all attendance
- Filter by date/user
- Dashboard statistics

## 🔧 Common Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📱 Access URLs

- Login: http://localhost:3000/login
- Register: http://localhost:3000/register
- Dashboard: http://localhost:3000/dashboard
- History: http://localhost:3000/history
- Admin: http://localhost:3000/admin (admin only)

## 🆘 Having Issues?

1. **Can't see data?**
   - Check `.env` file has correct Firebase credentials
   - Verify Firestore rules are published

2. **Authentication errors?**
   - Ensure Email/Password is enabled in Firebase Console

3. **Build errors?**
   - Delete `node_modules` folder
   - Run `npm install` again

4. **Port already in use?**
   - Change port in `vite.config.js`
   - Or kill the process using port 3000

---

That's it! You're ready to use the Attendance Management System. 🎊

For detailed documentation, see [README.md](README.md)
For Firebase setup, see [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
