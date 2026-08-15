import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import { useToast } from '../../components/Toast';
import {
  Building2,
  PlusCircle,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Star,
  User,
  AlertCircle
} from 'lucide-react';

const Stores = () => {
  const [stores, setStores] = useState([]);
  const [storeOwners, setStoreOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Filters & Sorting state
  const [nameFilter, setNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [addressFilter, setAddressFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Add Store Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStore, setNewStore] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: ''
  });
  const [addStoreErrors, setAddStoreErrors] = useState({});
  const [submittingStore, setSubmittingStore] = useState(false);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (nameFilter) params.append('name', nameFilter);
      if (emailFilter) params.append('email', emailFilter);
      if (addressFilter) params.append('address', addressFilter);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const res = await api.get(`/admin/stores?${params.toString()}`);
      if (res.data && res.data.data) {
        setStores(res.data.data.stores || []);
      }
    } catch (err) {
      console.error('Failed to load stores:', err);
      showToast('Failed to load stores list', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch store owners for the dropdown
  const fetchStoreOwners = async () => {
    try {
      const res = await api.get('/admin/users?role=store_owner');
      if (res.data && res.data.data) {
        setStoreOwners(res.data.data.users || []);
      }
    } catch (err) {
      console.error('Failed to load store owners:', err);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [nameFilter, emailFilter, addressFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchStoreOwners();
  }, []);

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

  // Add Store Validation
  const isNameValid = newStore.name.trim().length >= 20 && newStore.name.trim().length <= 60;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newStore.email.trim());
  const isAddressValid = newStore.address.trim().length > 0 && newStore.address.length <= 400;

  const handleAddStoreChange = (e) => {
    const { name, value } = e.target;
    setNewStore((prev) => ({ ...prev, [name]: value }));
    if (addStoreErrors[name]) {
      setAddStoreErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleAddStoreSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!isNameValid) errs.name = 'Store name must be between 20 and 60 characters';
    if (!isEmailValid) errs.email = 'Valid email is required';
    if (!isAddressValid) errs.address = 'Address is required and must not exceed 400 characters';

    if (Object.keys(errs).length > 0) {
      setAddStoreErrors(errs);
      return;
    }

    setSubmittingStore(true);
    try {
      await api.post('/admin/stores', {
        name: newStore.name.trim(),
        email: newStore.email.trim(),
        address: newStore.address.trim(),
        owner_id: newStore.owner_id || null
      });
      showToast('Store created successfully!', 'success');
      setIsAddModalOpen(false);
      setNewStore({
        name: '',
        email: '',
        address: '',
        owner_id: ''
      });
      fetchStores();
    } catch (err) {
      const backendErrors = err.response?.data?.errors;
      if (backendErrors && Array.isArray(backendErrors)) {
        const fieldErrors = {};
        backendErrors.forEach((e) => {
          fieldErrors[e.field] = e.message;
        });
        setAddStoreErrors(fieldErrors);
      } else {
        const msg = err.response?.data?.message || 'Failed to create store';
        showToast(msg, 'error');
      }
    } finally {
      setSubmittingStore(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem' }}>Store Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Filter, sort, and add new stores with assigned store owners and computed ratings.
          </p>
        </div>
        <button
          id="open-add-store-modal-btn"
          type="button"
          className="btn btn-primary"
          onClick={() => {
            fetchStoreOwners();
            setIsAddModalOpen(true);
          }}
        >
          <PlusCircle size={18} /> Add New Store
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Filter by Store Name</label>
            <input
              id="filter-store-name"
              type="text"
              className="form-input"
              placeholder="Search store name..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Filter by Email</label>
            <input
              id="filter-store-email"
              type="text"
              className="form-input"
              placeholder="Search store email..."
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Filter by Address</label>
            <input
              id="filter-store-address"
              type="text"
              className="form-input"
              placeholder="Search address..."
              value={addressFilter}
              onChange={(e) => setAddressFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Stores Table */}
      <div className="table-container">
        <table className="custom-table" id="stores-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => handleSort('name')} id="sort-store-name">
                <div className="sort-header-inner">
                  Store Name {renderSortIcon('name')}
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('email')} id="sort-store-email">
                <div className="sort-header-inner">
                  Email {renderSortIcon('email')}
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('address')} id="sort-store-address">
                <div className="sort-header-inner">
                  Address {renderSortIcon('address')}
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('rating')} id="sort-store-rating">
                <div className="sort-header-inner">
                  Overall Rating {renderSortIcon('rating')}
                </div>
              </th>
              <th>Assigned Owner</th>
              <th className="sortable" onClick={() => handleSort('createdAt')} id="sort-store-date">
                <div className="sort-header-inner">
                  Created At {renderSortIcon('createdAt')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  Loading stores...
                </td>
              </tr>
            ) : stores.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  No stores found matching the criteria.
                </td>
              </tr>
            ) : (
              stores.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{s.email}</td>
                  <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                    {s.address || '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span className="rating-badge">
                        ★ {s.averageRating !== null ? s.averageRating : 'N/A'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ({s.ratingCount || 0})
                      </span>
                    </div>
                  </td>
                  <td>
                    {s.owner ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#34d399', fontSize: '0.85rem' }}>
                        <User size={13} /> {s.owner.name}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Unassigned</span>
                    )}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {new Date(s.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Store Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register New Store">
        <form onSubmit={handleAddStoreSubmit}>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" htmlFor="new-store-name" style={{ margin: 0 }}>Store Name *</label>
              <span style={{ fontSize: '0.75rem', color: isNameValid ? 'var(--success)' : 'var(--text-muted)' }}>
                {newStore.name.length}/60 (min 20)
              </span>
            </div>
            <input
              id="new-store-name"
              name="name"
              type="text"
              className={`form-input ${addStoreErrors.name ? 'is-invalid' : ''}`}
              placeholder="e.g. Apex Hypermarket & Electronics Hub"
              value={newStore.name}
              onChange={handleAddStoreChange}
              maxLength={60}
              required
            />
            {addStoreErrors.name && (
              <div className="form-error">
                <AlertCircle size={14} /> {addStoreErrors.name}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="new-store-email">Contact Email *</label>
            <input
              id="new-store-email"
              name="email"
              type="email"
              className={`form-input ${addStoreErrors.email ? 'is-invalid' : ''}`}
              placeholder="contact@storedomain.com"
              value={newStore.email}
              onChange={handleAddStoreChange}
              required
            />
            {addStoreErrors.email && (
              <div className="form-error">
                <AlertCircle size={14} /> {addStoreErrors.email}
              </div>
            )}
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" htmlFor="new-store-address" style={{ margin: 0 }}>Physical Address *</label>
              <span style={{ fontSize: '0.75rem', color: isAddressValid ? 'var(--text-muted)' : 'var(--danger)' }}>
                {newStore.address.length}/400
              </span>
            </div>
            <textarea
              id="new-store-address"
              name="address"
              rows={3}
              className={`form-textarea ${addStoreErrors.address ? 'is-invalid' : ''}`}
              placeholder="Full address of the retail store"
              value={newStore.address}
              onChange={handleAddStoreChange}
              maxLength={400}
              required
            />
            {addStoreErrors.address && (
              <div className="form-error">
                <AlertCircle size={14} /> {addStoreErrors.address}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="new-store-owner">Assign Store Owner (Optional)</label>
            <select
              id="new-store-owner"
              name="owner_id"
              className="form-select"
              value={newStore.owner_id}
              onChange={handleAddStoreChange}
            >
              <option value="">-- Select Store Owner --</option>
              {storeOwners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} ({owner.email})
                </option>
              ))}
            </select>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Only users with the Store Owner role are listed above.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button
              id="submit-create-store-btn"
              type="submit"
              className="btn btn-primary"
              disabled={submittingStore || !isNameValid || !isEmailValid || !isAddressValid}
            >
              {submittingStore ? 'Registering...' : 'Register Store'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Stores;
