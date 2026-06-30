import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    // Restore session on mount
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, portalType) => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Enforce portal-specific role checks
      if (portalType === 'admin' && data.user.role !== 'ADMIN') {
        throw new Error('Access Denied: Admin credentials are required for the Admin Portal.');
      }
      if (portalType === 'sales' && data.user.role !== 'SALES_MANAGER') {
        throw new Error('Access Denied: Sales Manager credentials are required for the Sales Portal.');
      }

      const sessionUser = {
        email: data.user.email,
        fullName: data.user.fullName,
        role: data.user.role,
        token: data.token
      };

      setUser(sessionUser);
      localStorage.setItem('user', JSON.stringify(sessionUser));
      addToast(data.message || 'Welcome back!', 'success');
      return { success: true };
    } catch (error) {
      addToast(error.message, 'error');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (user?.role === 'ADMIN') {
      try {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/settings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({ apiKey: '' })
        });
      } catch (err) {
        console.error('Failed to clear API key on logout', err);
      }
    }
    setUser(null);
    localStorage.removeItem('user');
    addToast('Logged out successfully.', 'info');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
