import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import { Check, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { name, email, password, confirmPassword } = formData;

  // Validation conditions
  const isNameValid = name.trim().length >= 20 && name.trim().length <= 60;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const hasPasswordMinLength = password.length >= 8 && password.length <= 16;
  const hasPasswordUppercase = /[A-Z]/.test(password);
  const hasPasswordSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isPasswordValid = hasPasswordMinLength && hasPasswordUppercase && hasPasswordSpecialChar;
  const isConfirmPasswordMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleChange = (e) => {
    const { name: fieldName, value } = e.target;
    setFormData((prev) => ({ ...prev, [fieldName]: value }));

    // Clear field-specific error
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: null }));
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!isNameValid) {
      errs.name = 'Name must be between 20 and 60 characters';
    }
    if (!isEmailValid) {
      errs.email = 'Please provide a valid email address';
    }
    if (!isPasswordValid) {
      errs.password = 'Password must meet all complexity requirements';
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const newUser = await signup({
        name: name.trim(),
        email: email.trim(),
        password
      });
      showToast(`Account created successfully! Welcome, ${newUser.name}.`, 'success');
      navigate('/stores', { replace: true });
    } catch (err) {
      const backendErrors = err.response?.data?.errors;
      if (backendErrors && Array.isArray(backendErrors)) {
        const fieldErrors = {};
        backendErrors.forEach((e) => {
          fieldErrors[e.field] = e.message;
        });
        setErrors(fieldErrors);
      } else {
        const msg = err.response?.data?.message || 'Signup failed. Please check your information.';
        showToast(msg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <div className="auth-header">
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Create User Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            Join StoreRate to explore stores, submit ratings, and share honest reviews.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" htmlFor="signup-name" style={{ margin: 0 }}>Full Name *</label>
              <span style={{ fontSize: '0.75rem', color: isNameValid ? 'var(--success)' : 'var(--text-muted)' }}>
                {name.length}/60 (min 20)
              </span>
            </div>
            <input
              id="signup-name"
              name="name"
              type="text"
              className={`form-input ${errors.name ? 'is-invalid' : ''}`}
              placeholder="e.g. Alexander Jonathan Montgomery"
              value={name}
              onChange={handleChange}
              maxLength={60}
              required
            />
            {errors.name && (
              <div className="form-error">
                <AlertCircle size={14} /> {errors.name}
              </div>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="signup-email">Email Address *</label>
            <input
              id="signup-email"
              name="email"
              type="email"
              className={`form-input ${errors.email ? 'is-invalid' : ''}`}
              placeholder="name@example.com"
              value={email}
              onChange={handleChange}
              required
            />
            {errors.email && (
              <div className="form-error">
                <AlertCircle size={14} /> {errors.email}
              </div>
            )}
          </div>



          {/* Password */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" htmlFor="signup-password" style={{ margin: 0 }}>Password *</label>
              <span style={{ fontSize: '0.75rem', color: hasPasswordMinLength ? 'var(--success)' : 'var(--text-muted)' }}>
                {password.length}/16
              </span>
            </div>
            <input
              id="signup-password"
              name="password"
              type="password"
              className={`form-input ${errors.password ? 'is-invalid' : ''}`}
              placeholder="8–16 characters"
              value={password}
              onChange={handleChange}
              maxLength={16}
              required
            />
            {errors.password && (
              <div className="form-error">
                <AlertCircle size={14} /> {errors.password}
              </div>
            )}

            {/* Validation Checklist */}
            <div style={{ marginTop: '0.6rem', background: 'rgba(0,0,0,0.25)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.775rem' }}>
              <div style={{ color: hasPasswordMinLength ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
                <Check size={13} color={hasPasswordMinLength ? '#10b981' : '#64748b'} /> 8 to 16 characters in length
              </div>
              <div style={{ color: hasPasswordUppercase ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
                <Check size={13} color={hasPasswordUppercase ? '#10b981' : '#64748b'} /> At least 1 uppercase letter (A-Z)
              </div>
              <div style={{ color: hasPasswordSpecialChar ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Check size={13} color={hasPasswordSpecialChar ? '#10b981' : '#64748b'} /> At least 1 special character (!@#$%^&*)
              </div>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="signup-confirm-password">Confirm Password *</label>
            <input
              id="signup-confirm-password"
              name="confirmPassword"
              type="password"
              className={`form-input ${errors.confirmPassword ? 'is-invalid' : ''}`}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={handleChange}
              maxLength={16}
              required
            />
            {errors.confirmPassword && (
              <div className="form-error">
                <AlertCircle size={14} /> {errors.confirmPassword}
              </div>
            )}
            {isConfirmPasswordMatch && !errors.confirmPassword && (
              <div style={{ color: 'var(--success)', fontSize: '0.8rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Check size={14} /> Passwords match
              </div>
            )}
          </div>

          <button
            id="signup-submit-btn"
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.85rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
