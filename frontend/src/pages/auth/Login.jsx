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
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const from = location.state?.from?.pathname;

  // Validation conditions matching Signup.jsx
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const hasPasswordMinLength = password.length >= 8 && password.length <= 16;
  const hasPasswordUppercase = /[A-Z]/.test(password);
  const hasPasswordSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isPasswordValid = hasPasswordMinLength && hasPasswordUppercase && hasPasswordSpecialChar;

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: null }));
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: null }));
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!isEmailValid) {
      errs.email = 'Please provide a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (!isPasswordValid) {
      errs.password = 'Password must meet all complexity requirements';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const loggedInUser = await login(email.trim(), password);
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
    setErrors({});
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
                className={`form-input ${errors.email ? 'is-invalid' : ''}`}
                placeholder="name@example.com"
                value={email}
                onChange={handleEmailChange}
                required
                autoComplete="new-password"
              />
            </div>
            {errors.email && (
              <div className="form-error">
                <AlertCircle size={14} /> {errors.email}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type="password"
                className={`form-input ${errors.password ? 'is-invalid' : ''}`}
                placeholder="Enter your password"
                value={password}
                onChange={handlePasswordChange}
                required
                autoComplete="new-password"
              />
            </div>
            {errors.password && (
              <div className="form-error">
                <AlertCircle size={14} /> {errors.password}
              </div>
            )}
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
