import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password');
      return;
    }

    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      showToast(`Welcome back, ${loggedInUser.name}!`, 'success');

      if (from) {
        navigate(from, { replace: true });
      } else {
        // Unified single login system handles redirection dynamically based on the returned user role
        switch (loggedInUser.role) {
          case 'admin':
            navigate('/admin/dashboard', { replace: true });
            break;
          case 'store_owner':
            navigate('/store-owner/dashboard', { replace: true });
            break;
          default:
            navigate('/stores', { replace: true });
            break;
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Demo credential quick-fill
  const fillDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@storerate.com');
      setPassword('Admin@123');
    } else if (role === 'user') {
      setEmail('customer1@example.com');
      setPassword('Customer@123');
    } else if (role === 'store_owner') {
      setEmail('owner@storerate.com');
      setPassword('Owner@123');
    }
    setError('');
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            Log in to manage stores, view ratings, or share your feedback.
          </p>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem'
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={16} />
          </button>
        </form>

        {/* Demo Quick-Fill Buttons */}
        <div className="demo-credentials-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '0.6rem' }}>
            <Sparkles size={14} /> Quick Demo Logins:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            <button
              id="demo-admin-btn"
              type="button"
              className="demo-chip-btn"
              onClick={() => fillDemo('admin')}
            >
              👑 Admin (admin@storerate.com)
            </button>
            <button
              id="demo-owner-btn"
              type="button"
              className="demo-chip-btn"
              onClick={() => fillDemo('store_owner')}
            >
              🏢 Store Owner
            </button>
            <button
              id="demo-user-btn"
              type="button"
              className="demo-chip-btn"
              onClick={() => fillDemo('user')}
            >
              👤 Normal User
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ fontWeight: 600 }}>
            Sign up as Normal User
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
