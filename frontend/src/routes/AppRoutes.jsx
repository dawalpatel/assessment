import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

// Auth Pages
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard';
import AdminUsers from '../pages/admin/Users';
import AdminStores from '../pages/admin/Stores';

// Normal User Pages
import StoreListing from '../pages/user/StoreListing';

// Store Owner Pages
import StoreOwnerDashboard from '../pages/store-owner/Dashboard';

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  // Root redirect logic
  const getRootRedirect = () => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'store_owner') return <Navigate to="/store-owner/dashboard" replace />;
    return <Navigate to="/stores" replace />;
  };

  return (
    <Routes>
      {/* Root Route */}
      <Route path="/" element={getRootRedirect()} />

      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? getRootRedirect() : <Login />
        }
      />
      <Route
        path="/signup"
        element={
          isAuthenticated ? getRootRedirect() : <Signup />
        }
      />

      {/* Admin Protected Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['admin']}>
              <AdminUsers />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/stores"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['admin']}>
              <AdminStores />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Normal User Routes */}
      <Route
        path="/stores"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['user', 'admin']}>
              <StoreListing />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Store Owner Routes */}
      <Route
        path="/store-owner/dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['store_owner']}>
              <StoreOwnerDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Fallback 404 Route */}
      <Route path="*" element={getRootRedirect()} />
    </Routes>
  );
};

export default AppRoutes;
