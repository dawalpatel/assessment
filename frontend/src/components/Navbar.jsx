import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import UpdatePasswordModal from '../pages/shared/UpdatePasswordModal';
import {
  Store,
  Users,
  LayoutDashboard,
  LogOut,
  KeyRound,
  ShieldCheck,
  Building2,
  User as UserIcon,
  Star
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin, isStoreOwner, isNormalUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    showToast('Logged out successfully', 'success');
    navigate('/login');
  };

  const getRoleBadge = () => {
    if (!user) return null;
    switch (user.role) {
      case 'admin':
        return (
          <span className="badge badge-admin">
            <ShieldCheck size={12} /> Admin
          </span>
        );
      case 'store_owner':
        return (
          <span className="badge badge-store_owner">
            <Building2 size={12} /> Store Owner
          </span>
        );
      default:
        return (
          <span className="badge badge-user">
            <UserIcon size={12} /> User
          </span>
        );
    }
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="brand">
            <div className="brand-icon">
              <Star size={22} fill="#ffffff" />
            </div>
            <div>
              Store<span className="brand-gradient">Rate</span>
            </div>
          </Link>

          {isAuthenticated ? (
            <div className="nav-links">
              {isAdmin && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className={`nav-link ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}
                    id="nav-admin-dashboard"
                  >
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <Link
                    to="/admin/users"
                    className={`nav-link ${location.pathname === '/admin/users' ? 'active' : ''}`}
                    id="nav-admin-users"
                  >
                    <Users size={16} /> Users
                  </Link>
                  <Link
                    to="/admin/stores"
                    className={`nav-link ${location.pathname === '/admin/stores' ? 'active' : ''}`}
                    id="nav-admin-stores"
                  >
                    <Building2 size={16} /> Stores
                  </Link>
                </>
              )}

              {isNormalUser && (
                <Link
                  to="/stores"
                  className={`nav-link ${location.pathname === '/stores' ? 'active' : ''}`}
                  id="nav-user-stores"
                >
                  <Store size={16} /> Browse Stores
                </Link>
              )}

              {isStoreOwner && (
                <Link
                  to="/store-owner/dashboard"
                  className={`nav-link ${location.pathname === '/store-owner/dashboard' ? 'active' : ''}`}
                  id="nav-owner-dashboard"
                >
                  <LayoutDashboard size={16} /> My Store
                </Link>
              )}

              <div className="user-profile-menu">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {user?.name?.length > 25 ? `${user.name.slice(0, 25)}...` : user?.name}
                  </span>
                  {getRoleBadge()}
                </div>

                <button
                  id="navbar-update-password-btn"
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsPasswordModalOpen(true)}
                  title="Update Password"
                >
                  <KeyRound size={15} /> Password
                </button>

                <button
                  id="navbar-logout-btn"
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <LogOut size={15} /> Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="nav-links">
              <Link to="/login" className="btn btn-secondary btn-sm" id="nav-login-btn">
                Log In
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm" id="nav-signup-btn">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Global Update Password Modal */}
      <UpdatePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
