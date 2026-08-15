import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleRoute = ({ allowedRoles = [], children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: 'var(--text-secondary)' }}>
        Verifying permissions...
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect to proper role dashboard
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'store_owner') return <Navigate to="/store-owner/dashboard" replace />;
    return <Navigate to="/stores" replace />;
  }

  return children;
};

export default RoleRoute;
