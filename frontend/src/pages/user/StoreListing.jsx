import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StarRating from '../../components/StarRating';
import { useToast } from '../../components/Toast';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Star,
  Building,
  CheckCircle2,
  Edit3
} from 'lucide-react';

const StoreListing = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [submittingRatingId, setSubmittingRatingId] = useState(null);

  const { showToast } = useToast();

  const fetchStores = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const res = await api.get(`/stores?${params.toString()}`);
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

  useEffect(() => {
    fetchStores();
  }, [search, sortBy, sortOrder]);

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

  // Submit or modify rating inline
  const handleRateStore = async (storeId, newRatingValue) => {
    setSubmittingRatingId(storeId);
    const targetStore = stores.find((s) => s.id === storeId);
    const hasPreviousRating = targetStore && targetStore.userRating !== null;

    try {
      if (hasPreviousRating) {
        // Modify rating
        await api.put(`/stores/${storeId}/rating`, { rating: newRatingValue });
        showToast(`Rating updated to ${newRatingValue} stars!`, 'success');
      } else {
        // Submit new rating
        await api.post(`/stores/${storeId}/rating`, { rating: newRatingValue });
        showToast(`Rating of ${newRatingValue} stars submitted!`, 'success');
      }

      // Refresh stores to re-calculate average rating and set user rating
      await fetchStores();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit rating';
      showToast(msg, 'error');
    } finally {
      setSubmittingRatingId(null);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Explore & Rate Stores</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Browse registered stores, view community ratings, and submit or modify your ratings (1 to 5 stars) directly below.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div className="filter-bar" style={{ margin: 0 }}>
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input
              id="search-stores-input"
              type="text"
              className="form-input search-input"
              placeholder="Search by store name or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Showing {stores.length} {stores.length === 1 ? 'store' : 'stores'}
          </div>
        </div>
      </div>

      {/* Stores Table with Inline Rating */}
      <div className="table-container">
        <table className="custom-table" id="user-stores-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => handleSort('name')} id="sort-name">
                <div className="sort-header-inner">
                  Store Name {renderSortIcon('name')}
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('address')} id="sort-address">
                <div className="sort-header-inner">
                  Address {renderSortIcon('address')}
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('rating')} id="sort-overall-rating">
                <div className="sort-header-inner">
                  Overall Rating {renderSortIcon('rating')}
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('userRating')} id="sort-my-rating">
                <div className="sort-header-inner">
                  My Rating {renderSortIcon('userRating')}
                </div>
              </th>
              <th style={{ textAlign: 'center' }}>Submit / Modify Rating</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  Loading stores...
                </td>
              </tr>
            ) : stores.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  No stores found matching your search.
                </td>
              </tr>
            ) : (
              stores.map((store) => (
                <tr key={store.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Building size={16} color="var(--primary)" />
                      {store.name}
                    </div>
                  </td>
                  <td style={{ maxWidth: '280px', color: 'var(--text-secondary)' }}>
                    {store.address || '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="rating-badge">
                        ★ {store.averageRating !== null ? store.averageRating : 'N/A'}
                      </span>
                      <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                        ({store.ratingCount || 0} reviews)
                      </span>
                    </div>
                  </td>
                  <td>
                    {store.userRating !== null ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontWeight: 600, fontSize: '0.9rem' }}>
                        <CheckCircle2 size={16} /> Rated {store.userRating} ★
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Not rated yet</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                      <StarRating
                        rating={store.userRating || 0}
                        onRate={(val) => handleRateStore(store.id, val)}
                        size={22}
                      />
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {store.userRating ? 'Click star to change' : 'Click to rate (1–5)'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StoreListing;
