# MongoDB Migration Complete! 🎉

## What Changed?

Your attendance management system has been migrated from Firebase to MongoDB with REST API backend.

### Architecture Changes:
- **Database**: Firebase Firestore → MongoDB
- **Authentication**: Firebase Auth → JWT-based custom auth
- **Storage**: Firebase Storage → MongoDB (face descriptors stored as arrays)
- **Backend**: Serverless functions → Express.js REST API

## Quick Start

### 1. Install MongoDB

**Windows:**
- Download from https://www.mongodb.com/try/download/community
- Install MongoDBCompass for GUI management
- MongoDB service will start automatically

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and configure:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/attendance-system
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRE=30d
NODE_ENV=development
```

Start the backend:
```bash
npm run dev
```

Server will run on http://localhost:5000

### 3. Setup Frontend

```bash
npm install
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

App will run on http://localhost:5173

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Attendance
- `POST /api/attendance/checkin` - Check in
- `PUT /api/attendance/checkout` - Check out
- `GET /api/attendance/today` - Get today's attendance
- `GET /api/attendance/history` - Get attendance history
- `GET /api/attendance/all` - Get all attendance (admin)
- `GET /api/attendance/stats` - Get statistics (admin)

### Leave Management
- `POST /api/leave` - Submit leave request
- `GET /api/leave/my-requests` - Get my leave requests
- `GET /api/leave/all` - Get all leave requests (admin)
- `PUT /api/leave/:id/approve` - Approve leave (admin)
- `PUT /api/leave/:id/decline` - Decline leave (admin)
- `DELETE /api/leave/:id` - Delete leave request

### User Management
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `POST /api/users/:id/face-descriptor` - Save face descriptor
- `DELETE /api/users/:id` - Delete user (admin)

### Network
- `GET /api/network/whitelist` - Get network whitelist
- `POST /api/network/whitelist` - Add IP to whitelist (admin)
- `DELETE /api/network/whitelist/:id` - Remove from whitelist (admin)

## Data Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (employee/admin),
  department: String,
  faceDescriptor: [Number],
  createdAt: Date
}
```

### Attendance
```javascript
{
  userId: ObjectId,
  userName: String,
  department: String,
  date: String (YYYY-MM-DD),
  checkIn: Date,
  checkOut: Date,
  status: String (Present/Late/Absent),
  location: String,
  verifiedBy: String,
  matchScore: Number,
  networkVerified: Boolean,
  ipAddress: String
}
```

### Leave
```javascript
{
  userId: ObjectId,
  userName: String,
  userEmail: String,
  startDate: String,
  endDate: String,
  reason: String,
  status: String (pending/approved/declined),
  submittedAt: Date,
  reviewedAt: Date,
  reviewedBy: ObjectId,
  reviewerName: String,
  comments: String
}
```

## Testing

1. **Create Admin User:**
```bash
# Using API (Postman/curl)
POST http://localhost:5000/api/auth/register
{
  "email": "admin@company.com",
  "password": "admin123",
  "name": "Admin User",
  "department": "Management",
  "role": "admin"
}
```

2. **Login:**
```bash
POST http://localhost:5000/api/auth/login
{
  "email": "admin@company.com",
  "password": "admin123"
}
```

3. **Test Check-in:**
- Login to frontend
- Click "Check In"
- System works same as before!

## MongoDB Management

### Using MongoDB Compass (GUI)
- Download: https://www.mongodb.com/try/download/compass
- Connect to: `mongodb://localhost:27017`
- Browse collections: users, attendances, leaves, networkwhitelists

### Using MongoDB Shell
```bash
mongosh
use attendance-system
db.users.find()
db.attendances.find()
db.leaves.find()
```

## Deployment

### Backend Deployment (e.g., Railway, Render, Heroku)
1. Push backend code to Git
2. Set environment variables
3. Deploy
4. Update frontend `.env` with deployed API URL

### Frontend Deployment (e.g., Vercel, Netlify)
1. Push frontend code to Git
2. Set `VITE_API_URL` environment variable
3. Deploy

### MongoDB Atlas (Cloud Database)
1. Create free cluster at https://www.mongodb.com/cloud/atlas
2. Get connection string
3. Update backend `.env` `MONGODB_URI`

## Troubleshooting

### MongoDB won't start
```bash
# Check if MongoDB is running
mongosh

# Start MongoDB service
# Windows: Services app → MongoDB Server
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Backend errors
- Check MongoDB is running
- Verify `.env` configuration
- Check console for error messages

### Authentication issues
- Clear browser localStorage
- Check JWT_SECRET is set in backend `.env`
- Verify API URL in frontend `.env`

## Features Preserved
- ✅ User authentication (login/register)
- ✅ Check-in/Check-out
- ✅ Face recognition enrollment
- ✅ Face verification for check-in
- ✅ Attendance history
- ✅ Leave management
- ✅ Admin panel
- ✅ Network-based auto check-in
- ✅ Statistics and reporting
- ✅ All UI/UX features

## Support

All functionality remains the same from the user perspective. The migration is transparent to end-users!

For issues, check:
1. MongoDB is running
2. Backend is running on port 5000
3. Frontend .env has correct API URL
4. Browser console for errors
