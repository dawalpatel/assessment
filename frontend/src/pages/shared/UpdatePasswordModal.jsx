import React, { useState } from 'react';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import { KeyRound, Check, AlertCircle } from 'lucide-react';

const UpdatePasswordModal = ({ isOpen, onClose }) => {
  const { updatePassword } = useAuth();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Validation rules for password: 8-16 characters, >= 1 uppercase, >= 1 special char
  const hasMinLength = newPassword.length >= 8 && newPassword.length <= 16;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
  const isMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const validateForm = () => {
    const errs = {};
    if (!currentPassword) {
      errs.currentPassword = 'Current password is required';
    }
    if (!newPassword) {
      errs.newPassword = 'New password is required';
    } else if (!hasMinLength || !hasUppercase || !hasSpecialChar) {
      errs.newPassword = 'Password must meet all complexity requirements';
    }
    if (newPassword !== confirmPassword) {
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
      await updatePassword(currentPassword, newPassword);
      showToast('Password updated successfully!', 'success');
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update password';
      const backendErrors = err.response?.data?.errors;
      if (backendErrors && Array.isArray(backendErrors)) {
        const fieldErrors = {};
        backendErrors.forEach((e) => {
          fieldErrors[e.field] = e.message;
        });
        setErrors(fieldErrors);
      } else {
        showToast(msg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Update Password">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="current-password-input">Current Password *</label>
          <input
            id="current-password-input"
            type="password"
            className={`form-input ${errors.currentPassword ? 'is-invalid' : ''}`}
            placeholder="Enter your current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          {errors.currentPassword && (
            <div className="form-error">
              <AlertCircle size={14} /> {errors.currentPassword}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="new-password-input">New Password *</label>
          <input
            id="new-password-input"
            type="password"
            className={`form-input ${errors.newPassword ? 'is-invalid' : ''}`}
            placeholder="8–16 characters, uppercase & special char"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            maxLength={16}
          />
          {errors.newPassword && (
            <div className="form-error">
              <AlertCircle size={14} /> {errors.newPassword}
            </div>
          )}

          {/* Password complexity checklist */}
          <div style={{ marginTop: '0.65rem', background: 'rgba(0,0,0,0.2)', padding: '0.65rem', borderRadius: 'var(--radius-sm)', fontSize: '0.775rem' }}>
            <div style={{ color: hasMinLength ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
              <Check size={13} color={hasMinLength ? '#10b981' : '#64748b'} /> 8–16 characters long
            </div>
            <div style={{ color: hasUppercase ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
              <Check size={13} color={hasUppercase ? '#10b981' : '#64748b'} /> At least 1 uppercase letter (A-Z)
            </div>
            <div style={{ color: hasSpecialChar ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Check size={13} color={hasSpecialChar ? '#10b981' : '#64748b'} /> At least 1 special character (!@#$%^&*)
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="confirm-password-input">Confirm New Password *</label>
          <input
            id="confirm-password-input"
            type="password"
            className={`form-input ${errors.confirmPassword ? 'is-invalid' : ''}`}
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            maxLength={16}
          />
          {errors.confirmPassword && (
            <div className="form-error">
              <AlertCircle size={14} /> {errors.confirmPassword}
            </div>
          )}
          {isMatch && !errors.confirmPassword && (
            <div style={{ color: 'var(--success)', fontSize: '0.8rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Check size={14} /> Passwords match
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button
            id="submit-update-password-btn"
            type="submit"
            className="btn btn-primary"
            disabled={loading || !hasMinLength || !hasUppercase || !hasSpecialChar || !isMatch}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UpdatePasswordModal;
