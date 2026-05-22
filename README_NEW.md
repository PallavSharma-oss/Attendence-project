# Attendance Management System - MongoDB Edition

A modern attendance management system with face recognition, built with React, Node.js, Express, and MongoDB.

## Features

- 🔐 **JWT Authentication** - Secure user authentication with JWT tokens
- 👤 **User Management** - Admin panel for managing users
- ✅ **Check-in/Check-out** - Track employee attendance
- 🤖 **Face Recognition** - Optional face verification using face-api.js
- 📊 **Analytics Dashboard** - View attendance statistics and insights
- 🏖️ **Leave Management** - Submit and approve leave requests
- 🌐 **Network Auto Check-in** - Automatic check-in when connected to office network
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

### Frontend
- React 18
- React Router v6
- Tailwind CSS
- Axios
- face-api.js

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd attendance-system
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Setup MongoDB**
   
   Install MongoDB:
   - Windows: Download from https://www.mongodb.com/try/download/community
   - Mac: `brew install mongodb-community`
   - Linux: Follow official docs
   
   Start MongoDB:
   ```bash
   # Mac/Linux
   mongod
   
   # Windows - Service starts automatically
   ```

5. **Configure Backend Environment**
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/attendance-system
   JWT_SECRET=your-super-secret-key-change-this-in-production
   JWT_EXPIRE=30d
   NODE_ENV=development
   ```

6. **Configure Frontend Environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

7. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Server runs on http://localhost:5000

8. **Start the Frontend**
   ```bash
   npm run dev
   ```
   App runs on http://localhost:5173

## Usage

### First Time Setup

1. **Register an Admin User**
   - Go to `/register`
   - Fill in the details
   - Set Role to "Admin"
   - Click Register

2. **Login**
   - Go to `/login`
   - Enter your credentials

3. **Enroll Face (Optional)**
   - Go to Profile → Enroll Face
   - Allow camera access
   - Position your face in the frame
   - System will automatically capture

4. **Check In**
   - Click "Check In" button
   - Optional: Use face verification
   - View your attendance record

### Admin Features

- View all employee attendance
- Manage leave requests
- Add/Edit/Delete users
- View statistics and analytics
- Configure network auto check-in

## API Documentation

See [MONGODB_MIGRATION_GUIDE.md](MONGODB_MIGRATION_GUIDE.md) for complete API documentation.

## Project Structure

```
attendance-system/
├── backend/                 # Express backend
│   ├── config/             # Database configuration
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── middleware/         # Auth middleware
│   ├── utils/              # Utility functions
│   └── server.js           # Entry point
├── src/                    # React frontend
│   ├── components/         # Reusable components
│   ├── context/            # React context
│   ├── face/               # Face recognition
│   ├── hooks/              # Custom hooks
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── theme/              # Design system
│   └── utils/              # Utilities
└── public/                 # Static assets
```

## Security

- Passwords are hashed using bcryptjs
- JWT tokens for authentication
- Protected API routes with middleware
- Input validation on all endpoints
- CORS configured for security

## Deployment

### Backend (Render/Railway/Heroku)
1. Push code to GitHub
2. Connect to deployment platform
3. Set environment variables
4. Deploy

### Frontend (Vercel/Netlify)
1. Push code to GitHub
2. Connect to deployment platform
3. Set `VITE_API_URL` to your backend URL
4. Deploy

### MongoDB Atlas (Cloud Database)
1. Create cluster at https://www.mongodb.com/cloud/atlas
2. Get connection string
3. Update `MONGODB_URI` in backend `.env`

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- Verify MongoDB service is started

### Authentication Issues
- Clear browser localStorage
- Check JWT_SECRET in backend `.env`
- Verify API URL in frontend `.env`

### Face Recognition Issues
- Ensure HTTPS in production
- Check camera permissions
- Models load from CDN (requires internet)

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use for personal or commercial purposes.

## Support

For issues or questions, please create an issue in the repository.

---

Built with ❤️ using React, Node.js, Express, and MongoDB
