# Quick Start Guide - MongoDB Version

## 🚀 Get Started in 10 Minutes

### Step 1: Install MongoDB (2 minutes)

**Windows:**
1. Download from https://www.mongodb.com/try/download/community
2. Run installer (default settings)
3. MongoDB starts automatically as a service

**Mac:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

Verify MongoDB is running:
```bash
mongosh
# Should connect successfully
```

### Step 2: Install Backend Dependencies (2 minutes)
```bash
cd backend
npm install
```

### Step 3: Configure Backend (1 minute)
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/attendance-system
JWT_SECRET=my-super-secret-key-12345
JWT_EXPIRE=30d
NODE_ENV=development
```

### Step 4: Start Backend Server (1 minute)
```bash
cd backend
npm run dev
```

You should see:
```
Server running on port 5000
MongoDB Connected: localhost
```

### Step 5: Install Frontend Dependencies (2 minutes)
```bash
# In project root
npm install
```

### Step 6: Configure Frontend (1 minute)
```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

### Step 7: Start Frontend (1 minute)
```bash
npm run dev
```

Open http://localhost:5173 in your browser 🎉

## 📝 Test the System

### 1. Register Your First User (Admin):
1. Click "Register" or go to `/register`
2. Fill in the form:
   - Name: Admin User
   - Email: admin@company.com
   - Password: admin123
   - Department: Management
   - Role: **Admin**
3. Click Register

### 2. Test Login:
1. Login with: admin@company.com / admin123
2. You'll see the Dashboard

### 3. Test Check-In:
1. Click "Check In" button
2. Status changes to "Present" or "Late"
3. Time is recorded

### 4. Test Check-Out:
1. Click "Check Out" button
2. Your work hours are calculated

### 5. View History:
1. Go to "History" page
2. See all your attendance records

### 6. Admin Panel (Admin users only):
1. Go to "/admin"
2. View all users and attendance
3. Manage leave requests

## 🎯 Key Features to Test

✅ **Employee Dashboard:**
- Check in/out
- View today's attendance
- View attendance history
- Submit leave requests
- Enroll face for verification

✅ **Admin Dashboard:**
- View all employees
- View all attendance records
- Approve/decline leave requests
- Add/edit/delete users
- View statistics

✅ **Face Recognition:**
- Go to Profile → Enroll Face
- Allow camera access
- System captures your face
- Use "Face Check-In" for verification

✅ **Leave Management:**
- Submit leave request
- Admin can approve/decline
- View leave history

## 🔧 Troubleshooting

### MongoDB not starting?
```bash
# Windows: Check Services app → MongoDB Server
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# Verify:
mongosh
```

### Backend won't start?
- Check if MongoDB is running
- Verify `.env` file in backend folder
- Check port 5000 is not in use

### Frontend API errors?
- Ensure backend is running
- Check VITE_API_URL in `.env`
- Open browser console for errors

### Clear everything and restart:
```bash
# Stop all servers (Ctrl+C)
# Clear browser localStorage
localStorage.clear()

# Restart backend
cd backend
npm run dev

# Restart frontend (new terminal)
npm run dev
```

## 📊 MongoDB Management

### View Your Data:

**Option 1: MongoDB Compass (GUI)**
- Download: https://www.mongodb.com/try/download/compass
- Connect to: `mongodb://localhost:27017`
- Database: `attendance-system`
- Collections: users, attendances, leaves

**Option 2: MongoDB Shell**
```bash
mongosh

use attendance-system

# View all users
db.users.find().pretty()

# View all attendance
db.attendances.find().pretty()

# View all leaves
db.leaves.find().pretty()
```

## 🚀 Next Steps

1. **Customize for your needs:**
   - Modify check-in time rules
   - Add departments
   - Configure work schedule

2. **Deploy to production:**
   - See MONGODB_MIGRATION_GUIDE.md
   - Deploy backend to Railway/Render
   - Deploy frontend to Vercel/Netlify
   - Use MongoDB Atlas for cloud database

3. **Enhance:**
   - Add more reports
   - Customize leave types
   - Add notifications
   - Integrate with HR systems

## 💡 Tips

- Use MongoDB Compass to visualize your data
- Check backend console for API logs
- Check browser console for frontend errors
- All previous functionality works the same!

---

Need help? Check MONGODB_MIGRATION_GUIDE.md for detailed documentation!
