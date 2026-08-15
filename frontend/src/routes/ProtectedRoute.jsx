import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, logout } = useAuth();
  const location = useLocation();
  const token = localStorage.getItem('token');

  const isTokenExpired = (t) => {
    if (!t) return true;
    try {
      const parts = t.split('.');
      if (parts.length !== 3) return true;
      // Decode Base64 URL payload
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return true;
      }
      return false;
    } catch (e) {
      return true;
    }
  };

  const isExpired = isTokenExpired(token);

  useEffect(() => {
    if (!token || isExpired) {
      logout();
    }
  }, [token, isExpired, logout]);

  if (!token || isExpired) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: 'var(--text-secondary)' }}>
        Loading authentication...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
