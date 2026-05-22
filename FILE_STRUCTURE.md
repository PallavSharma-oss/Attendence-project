# Project File Structure

```
attendance-system/
│
├── 📄 package.json                 # Project dependencies and scripts
├── 📄 vite.config.js              # Vite configuration
├── 📄 index.html                  # HTML entry point
├── 📄 .gitignore                  # Git ignore rules
├── 📄 .env.example                # Environment variables template
│
├── 📁 src/                        # Source code directory
│   │
│   ├── 📄 main.jsx                # Application entry point
│   ├── 📄 App.jsx                 # Main App component with routing
│   ├── 📄 App.css                 # App styles
│   ├── 📄 index.css               # Global styles
│   │
│   ├── 📁 firebase/               # Firebase configuration
│   │   └── 📄 config.js           # Firebase initialization & exports
│   │
│   ├── 📁 context/                # React Context providers
│   │   └── 📄 AuthContext.jsx    # Authentication state & functions
│   │
│   ├── 📁 hooks/                  # Custom React hooks
│   │   └── 📄 useAttendance.js   # Attendance CRUD operations
│   │
│   ├── 📁 pages/                  # Page components
│   │   ├── 📄 Login.jsx          # Login page
│   │   ├── 📄 Register.jsx       # Registration page
│   │   ├── 📄 Dashboard.jsx      # Main dashboard (check-in/out)
│   │   ├── 📄 History.jsx        # Personal attendance history
│   │   └── 📄 Admin.jsx          # Admin panel (all users/attendance)
│   │
│   └── 📁 components/             # Reusable components
│       ├── 📄 Navbar.jsx         # Navigation bar
│       ├── 📄 ProtectedRoute.jsx # Route protection wrapper
│       └── 📄 AttendanceCard.jsx # Attendance display card
│
├── 📁 Documentation/              # Project documentation
│   ├── 📄 README.md              # Main documentation
│   ├── 📄 QUICKSTART.md          # Quick start guide
│   ├── 📄 FIREBASE_SETUP.md      # Firebase setup instructions
│   └── 📄 firestore.rules        # Firestore security rules
│
└── 📁 node_modules/               # Dependencies (after npm install)
```

## 📋 File Descriptions

### Configuration Files

| File | Description |
|------|-------------|
| `package.json` | Project metadata, dependencies, and npm scripts |
| `vite.config.js` | Vite bundler configuration (port, plugins, etc.) |
| `index.html` | HTML template with root div for React |
| `.env.example` | Template for environment variables |
| `.gitignore` | Files/folders to ignore in git |

### Core Application Files

| File | Purpose |
|------|---------|
| `src/main.jsx` | ReactDOM render entry point |
| `src/App.jsx` | Main component with router setup |
| `src/index.css` | Global CSS styles |

### Firebase Integration

| File | Contains |
|------|----------|
| `src/firebase/config.js` | Firebase initialization, auth & db exports |

### State Management

| File | Manages |
|------|---------|
| `src/context/AuthContext.jsx` | User authentication state, login/logout functions |

### Custom Hooks

| Hook | Functionality |
|------|---------------|
| `src/hooks/useAttendance.js` | Check-in, check-out, fetch attendance records |

### Pages (Routes)

| Page | Route | Access | Description |
|------|-------|--------|-------------|
| `Login.jsx` | `/login` | Public | User login form |
| `Register.jsx` | `/register` | Public | New user registration |
| `Dashboard.jsx` | `/dashboard` | Protected | Check-in/out & today's status |
| `History.jsx` | `/history` | Protected | Personal attendance history |
| `Admin.jsx` | `/admin` | Admin Only | All employees & attendance data |

### Reusable Components

| Component | Usage |
|-----------|-------|
| `Navbar.jsx` | Top navigation with user menu |
| `ProtectedRoute.jsx` | Wraps routes requiring authentication |
| `AttendanceCard.jsx` | Displays single attendance record |

## 🔥 Firebase Collections

### Firestore Structure

```
firestore/
│
├── 📁 users/                      # Users collection
│   └── 📄 {uid}                   # Document per user
│       ├── uid: string
│       ├── name: string
│       ├── email: string
│       ├── role: 'admin' | 'employee'
│       ├── department: string
│       └── createdAt: timestamp
│
└── 📁 attendance/                 # Attendance records
    └── 📄 {auto-id}              # Document per attendance
        ├── userId: string
        ├── userName: string
        ├── department: string
        ├── date: string (YYYY-MM-DD)
        ├── checkIn: string (ISO)
        ├── checkOut: string | null
        ├── status: 'Present' | 'Late' | 'Absent'
        ├── location: string
        └── timestamp: serverTimestamp
```

## 🛣️ Application Routes

```
/                    → Redirect to /dashboard
/login               → Login page (public)
/register            → Register page (public)
/dashboard           → Main dashboard (protected)
/history             → Attendance history (protected)
/admin               → Admin panel (admin only)
*                    → Redirect to /dashboard
```

## 🔐 Route Protection Levels

1. **Public Routes**: Anyone can access
   - `/login`
   - `/register`

2. **Protected Routes**: Authenticated users only
   - `/dashboard`
   - `/history`

3. **Admin Routes**: Admin role required
   - `/admin`

## 📦 Key Dependencies

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.22.0",
  "firebase": "^10.8.0",
  "@mui/material": "^5.15.10",
  "@mui/icons-material": "^5.15.10",
  "@emotion/react": "^11.11.3",
  "@emotion/styled": "^11.11.0",
  "vite": "^5.1.0"
}
```

## 🎨 UI Components Used

- **Material-UI (MUI)**
  - Container, Paper, Card
  - Typography, Button, TextField
  - Table, Chip, Alert
  - AppBar, Toolbar, Menu
  - CircularProgress
  - Icons

## 🔧 Build Output

After running `npm run build`:

```
dist/
├── index.html
├── assets/
│   ├── index.[hash].js
│   └── index.[hash].css
└── vite.svg
```

---

This structure follows React best practices with clear separation of concerns:
- **Components**: Reusable UI elements
- **Pages**: Route-level components
- **Context**: Global state management
- **Hooks**: Reusable business logic
- **Firebase**: Backend integration

Each file has a single responsibility, making the codebase maintainable and scalable.
