// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      try {
        if (token && savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser({ uid: parsedUser.uid, email: parsedUser.email });
          
          // Fetch fresh user details from API with timeout
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('API timeout')), 5000)
          );
          
          try {
            const result = await Promise.race([
              authService.getCurrentUser(),
              timeoutPromise
            ]);
            
            if (result.success) {
              setUserDetails(result.data);
              localStorage.setItem('user', JSON.stringify(result.data));
            } else {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
              setUserDetails(null);
            }
          } catch (apiError) {
            console.error('Error fetching user details:', apiError);
            // Don't clear tokens on timeout, just continue loading
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setUserDetails(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const register = async (email, password, name, department, role = 'employee') => {
    try {
      const result = await authService.register(email, password, name, department, role);
      
      if (result.success) {
        setUser({ uid: result.data.uid, email: result.data.email });
        setUserDetails(result.data);
        return { success: true };
      }
      
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      const result = await authService.login(email, password);
      
      if (result.success) {
        setUser({ uid: result.data.uid, email: result.data.email });
        setUserDetails(result.data);
        return { success: true };
      }
      
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      authService.logout();
      setUser(null);
      setUserDetails(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getCurrentUserProfile = async () => {
    try {
      const result = await authService.getCurrentUser();
      if (result.success) {
        setUserDetails(result.data);
        return { success: true, data: result.data };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    userDetails,
    loading,
    register,
    login,
    logout,
    getCurrentUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
