import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    const verifyAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data && res.data.data?.user) {
            setUser(res.data.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.data.user));
          }
        } catch (err) {
          console.error('Session expired:', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = res.data.data;
    
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    return newUser;
  };

  const signup = async (userData) => {
    const res = await api.post('/auth/signup', userData);
    const { token: newToken, user: newUser } = res.data.data;
    
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    return newUser;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore logout request errors
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    const res = await api.put('/auth/update-password', {
      currentPassword,
      newPassword
    });
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        updatePassword,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.role === 'admin',
        isStoreOwner: user?.role === 'store_owner',
        isNormalUser: user?.role === 'user'
      }}
    >
      {children}
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
