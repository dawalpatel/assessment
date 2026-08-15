import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import { useToast } from '../../components/Toast';
import {
  UserPlus,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  ShieldCheck,
  Building2,
  User as UserIcon,
  Check,
  AlertCircle,
  Star
} from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Filters & Sorting state
  const [nameFilter, setNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [addressFilter, setAddressFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Add User Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'user'
  });
  const [addUserErrors, setAddUserErrors] = useState({});
  const [submittingUser, setSubmittingUser] = useState(false);

  // User Details Modal state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (nameFilter) params.append('name', nameFilter);
      if (emailFilter) params.append('email', emailFilter);
      if (addressFilter) params.append('address', addressFilter);
      if (roleFilter) params.append('role', roleFilter);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.data && res.data.data) {
        setUsers(res.data.data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
      showToast('Failed to load users list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [nameFilter, emailFilter, addressFilter, roleFilter, sortBy, sortOrder]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortOrder('ASC');
    }
  };

  const renderSortIcon = (column) => {
    if (sortBy !== column) {
      return <ArrowUpDown size={14} style={{ opacity: 0.4 }} />;
    }
    return sortOrder === 'ASC' ? <ArrowUp size={14} color="var(--primary)" /> : <ArrowDown size={14} color="var(--primary)" />;
  };

  // Add User form validation
  const isNameValid = newUser.name.trim().length >= 20 && newUser.name.trim().length <= 60;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email.trim());
  const hasPasswordMinLength = newUser.password.length >= 8 && newUser.password.length <= 16;
  const hasPasswordUppercase = /[A-Z]/.test(newUser.password);
  const hasPasswordSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newUser.password);
  const isPasswordValid = hasPasswordMinLength && hasPasswordUppercase && hasPasswordSpecialChar;
  const isAddressValid = newUser.address.length <= 400;

  const handleAddUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
    if (addUserErrors[name]) {
      setAddUserErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!isNameValid) errs.name = 'Name must be between 20 and 60 characters';
    if (!isEmailValid) errs.email = 'Valid email is required';
    if (!isPasswordValid) errs.password = 'Password must meet all complexity requirements';
    if (!isAddressValid) errs.address = 'Address must not exceed 400 characters';
    if (Object.keys(errs).length > 0) {
      setAddUserErrors(errs);
      return;
    }

    setSubmittingUser(true);
    try {
      await api.post('/admin/users', {
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        password: newUser.password,
        address: newUser.address.trim() || undefined,
        role: newUser.role
      });
      showToast('User created successfully!', 'success');
      setIsAddModalOpen(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        address: '',
        role: 'user'
      });
      fetchUsers();
    } catch (err) {
      const backendErrors = err.response?.data?.errors;
      if (backendErrors && Array.isArray(backendErrors)) {
        const fieldErrors = {};
        backendErrors.forEach((e) => {
          fieldErrors[e.field] = e.message;
        });
        setAddUserErrors(fieldErrors);
      } else {
        const msg = err.response?.data?.message || 'Failed to create user';
        showToast(msg, 'error');
      }
    } finally {
      setSubmittingUser(false);
    }
  };

  // View User Details
  const handleViewDetails = async (userId) => {
    setIsDetailModalOpen(true);
    setLoadingDetails(true);
    try {
      const res = await api.get(`/admin/users/${userId}`);
      if (res.data && res.data.data) {
        setSelectedUser(res.data.data.user);
      }
    } catch (err) {
      console.error('Failed to load user details:', err);
      showToast('Failed to load user details', 'error');
      setIsDetailModalOpen(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem' }}>User Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Filter, sort, and add new users across all system roles.
          </p>
        </div>
        <button
          id="open-add-user-modal-btn"
          type="button"
          className="btn btn-primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          <UserPlus size={18} /> Add New User
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Filter by Name</label>
            <input
              id="filter-user-name"
              type="text"
              className="form-input"
              placeholder="Search name..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Filter by Email</label>
            <input
              id="filter-user-email"
              type="text"
              className="form-input"
              placeholder="Search email..."
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Filter by Address</label>
            <input
              id="filter-user-address"
              type="text"
              className="form-input"
              placeholder="Search address..."
              value={addressFilter}
              onChange={(e) => setAddressFilter(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Filter by Role</label>
            <select
              id="filter-user-role"
              className="form-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="store_owner">Store Owner</option>
              <option value="user">Normal User</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="custom-table" id="users-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => handleSort('name')} id="sort-user-name">
                <div className="sort-header-inner">
                  Name {renderSortIcon('name')}
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('email')} id="sort-user-email">
                <div className="sort-header-inner">
                  Email {renderSortIcon('email')}
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('address')} id="sort-user-address">
                <div className="sort-header-inner">
                  Address {renderSortIcon('address')}
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('role')} id="sort-user-role">
                <div className="sort-header-inner">
                  Role {renderSortIcon('role')}
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('createdAt')} id="sort-user-date">
                <div className="sort-header-inner">
                  Created At {renderSortIcon('createdAt')}
                </div>
              </th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  No users found matching the criteria.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                    {u.address || '—'}
                  </td>
                  <td>{getRoleBadge(u.role)}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleViewDetails(u.id)}
                      title="View Details"
                    >
                      <Eye size={14} /> Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New User">
        <form onSubmit={handleAddUserSubmit}>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" htmlFor="new-user-name" style={{ margin: 0 }}>Full Name *</label>
              <span style={{ fontSize: '0.75rem', color: isNameValid ? 'var(--success)' : 'var(--text-muted)' }}>
                {newUser.name.length}/60 (min 20)
              </span>
            </div>
            <input
              id="new-user-name"
              name="name"
              type="text"
              className={`form-input ${addUserErrors.name ? 'is-invalid' : ''}`}
              placeholder="e.g. Richard Jonathan Henderson"
              value={newUser.name}
              onChange={handleAddUserChange}
              maxLength={60}
              required
            />
            {addUserErrors.name && (
              <div className="form-error">
                <AlertCircle size={14} /> {addUserErrors.name}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="new-user-email">Email Address *</label>
            <input
              id="new-user-email"
              name="email"
              type="email"
              className={`form-input ${addUserErrors.email ? 'is-invalid' : ''}`}
              placeholder="user@example.com"
              value={newUser.email}
              onChange={handleAddUserChange}
              required
            />
            {addUserErrors.email && (
              <div className="form-error">
                <AlertCircle size={14} /> {addUserErrors.email}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="new-user-role">Role *</label>
            <select
              id="new-user-role"
              name="role"
              className="form-select"
              value={newUser.role}
              onChange={handleAddUserChange}
            >
              <option value="user">Normal User</option>
              <option value="store_owner">Store Owner</option>
              <option value="admin">System Administrator</option>
            </select>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" htmlFor="new-user-address" style={{ margin: 0 }}>Address (Optional)</label>
              <span style={{ fontSize: '0.75rem', color: isAddressValid ? 'var(--text-muted)' : 'var(--danger)' }}>
                {newUser.address.length}/400
              </span>
            </div>
            <textarea
              id="new-user-address"
              name="address"
              rows={2}
              className={`form-textarea ${addUserErrors.address ? 'is-invalid' : ''}`}
              placeholder="User street address"
              value={newUser.address}
              onChange={handleAddUserChange}
              maxLength={400}
            />
            {addUserErrors.address && (
              <div className="form-error">
                <AlertCircle size={14} /> {addUserErrors.address}
              </div>
            )}
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" htmlFor="new-user-password" style={{ margin: 0 }}>Password *</label>
              <span style={{ fontSize: '0.75rem', color: hasPasswordMinLength ? 'var(--success)' : 'var(--text-muted)' }}>
                {newUser.password.length}/16
              </span>
            </div>
            <input
              id="new-user-password"
              name="password"
              type="password"
              className={`form-input ${addUserErrors.password ? 'is-invalid' : ''}`}
              placeholder="8–16 characters, uppercase & special char"
              value={newUser.password}
              onChange={handleAddUserChange}
              maxLength={16}
              required
            />
            {addUserErrors.password && (
              <div className="form-error">
                <AlertCircle size={14} /> {addUserErrors.password}
              </div>
            )}
            {/* Checklist */}
            <div style={{ marginTop: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' }}>
              <div style={{ color: hasPasswordMinLength ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Check size={12} /> 8–16 characters
              </div>
              <div style={{ color: hasPasswordUppercase ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Check size={12} /> At least 1 uppercase letter
              </div>
              <div style={{ color: hasPasswordSpecialChar ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Check size={12} /> At least 1 special character
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button
              id="submit-create-user-btn"
              type="submit"
              className="btn btn-primary"
              disabled={submittingUser || !isNameValid || !isEmailValid || !isPasswordValid}
            >
              {submittingUser ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View User Details Modal */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="User Details">
        {loadingDetails || !selectedUser ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Loading user details...
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{selectedUser.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{selectedUser.email}</p>
              </div>
              {getRoleBadge(selectedUser.role)}
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Address:</strong>
                <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{selectedUser.address || 'None provided'}</p>
              </div>
              <div>
                <strong style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Member Since:</strong>
                <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                  {new Date(selectedUser.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* If role === store_owner, display average rating and owned stores */}
            {selectedUser.role === 'store_owner' && (
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Building2 size={16} color="var(--primary)" /> Store Owner Analytics
                </h4>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(99, 102, 241, 0.08)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Average Rating</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                      <Star size={20} fill="#fbbf24" stroke="#fbbf24" />
                      <span style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                        {selectedUser.averageRating !== null ? `${selectedUser.averageRating} / 5.0` : 'No ratings yet'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Ratings Received</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.2rem' }}>
                      {selectedUser.totalRatingsCount || 0}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Assigned Stores ({selectedUser.stores?.length || 0})
                </div>

                {selectedUser.stores && selectedUser.stores.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedUser.stores.map((s) => (
                      <div
                        key={s.id}
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          padding: '0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.email}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span className="rating-badge">
                            ★ {s.averageRating !== null ? s.averageRating : 'N/A'}
                          </span>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {s.ratingCount} {s.ratingCount === 1 ? 'review' : 'reviews'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No stores assigned to this owner.</p>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Users;
