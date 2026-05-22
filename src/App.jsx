// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ThemeProvider from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Leave from './pages/Leave';
import PresenceIntelligence from './pages/PresenceIntelligence';
import Kiosk from './pages/Kiosk';
import QrKiosk from './pages/QrKiosk';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import ToastProvider from './components/ToastProvider';
import FaceEnroll from './components/FaceEnroll';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/leaves"
                element={
                  <ProtectedRoute>
                    <Leave />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/face-enroll"
                element={
                  <ProtectedRoute>
                    <FaceEnroll />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/presence-intelligence"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'hr']}>
                    <PresenceIntelligence />
                  </ProtectedRoute>
                }
              />
              <Route path="/kiosk" element={<Kiosk />} />
              <Route path="/qr-kiosk" element={<QrKiosk />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <Admin />
                  </ProtectedRoute>
                }
              />

              {/* Default Route */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
