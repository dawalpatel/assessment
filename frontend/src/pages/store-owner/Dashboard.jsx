import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StarRating from '../../components/StarRating';
import StatCard from '../../components/StatCard';
import { useToast } from '../../components/Toast';
import {
  Building2,
  Star,
  Users,
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Mail,
  MapPin
} from 'lucide-react';

const StoreOwnerDashboard = () => {
  const [data, setData] = useState({
    hasStore: false,
    stores: [],
    primaryStore: null,
    averageRating: null,
    totalRatings: 0,
    raters: []
  });
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('DESC');

  const { showToast } = useToast();

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/store-owner/dashboard?sortBy=${sortBy}&sortOrder=${sortOrder}`);
      if (res.data && res.data.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load store owner dashboard:', err);
      showToast('Failed to load store dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [sortBy, sortOrder]);

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

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Store Owner Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Monitor your store performance, overall customer rating, and individual customer feedback.
        </p>
      </div>

      {!loading && !data.hasStore ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <Building2 size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Store Assigned Yet</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto' }}>
            Your account is registered as a Store Owner. A system administrator needs to assign a store to your account before ratings appear.
          </p>
        </div>
      ) : (
        <>
          {/* Store Info Banner */}
          {data.primaryStore && (
            <div
              className="card"
              style={{
                marginBottom: '1.75rem',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.25)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                    <Building2 size={24} color="var(--primary)" />
                    <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{data.primaryStore.name}</h2>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Mail size={14} /> {data.primaryStore.email}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={14} /> {data.primaryStore.address}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-store_owner" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                    Active Store Listing
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="stats-grid">
            <StatCard
              title="Average Store Rating"
              value={
                loading ? '...' : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>{data.averageRating !== null ? `${data.averageRating} / 5.0` : 'No ratings'}</span>
                    {data.averageRating !== null && <Star size={24} fill="#fbbf24" stroke="#fbbf24" />}
                  </div>
                )
              }
              icon={Star}
              color="amber"
              subtitle="Calculated across all customer reviews"
            />
            <StatCard
              title="Total Customer Ratings"
              value={loading ? '...' : data.totalRatings}
              icon={Users}
              color="blue"
              subtitle="Total verified customer ratings submitted"
            />
          </div>

          {/* Table of Raters */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={18} color="var(--primary)" /> Customer Ratings & Reviews ({data.raters?.length || 0})
              </h3>
            </div>

            <div className="table-container" style={{ border: 'none' }}>
              <table className="custom-table" id="owner-raters-table">
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => handleSort('userName')} id="sort-rater-name">
                      <div className="sort-header-inner">
                        Customer Name {renderSortIcon('userName')}
                      </div>
                    </th>
                    <th className="sortable" onClick={() => handleSort('userEmail')} id="sort-rater-email">
                      <div className="sort-header-inner">
                        Email Address {renderSortIcon('userEmail')}
                      </div>
                    </th>
                    <th className="sortable" onClick={() => handleSort('rating')} id="sort-rater-rating">
                      <div className="sort-header-inner">
                        Rating Given {renderSortIcon('rating')}
                      </div>
                    </th>
                    <th className="sortable" onClick={() => handleSort('date')} id="sort-rater-date">
                      <div className="sort-header-inner">
                        Date Rated {renderSortIcon('date')}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        Loading customer ratings...
                      </td>
                    </tr>
                  ) : !data.raters || data.raters.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        No ratings have been submitted for your store yet.
                      </td>
                    </tr>
                  ) : (
                    data.raters.map((rater) => (
                      <tr key={rater.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{rater.userName}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{rater.userEmail}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <StarRating rating={rater.rating} readOnly={true} size={16} />
                            <span style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.875rem' }}>
                              ({rater.rating} ★)
                            </span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {new Date(rater.updatedAt || rater.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StoreOwnerDashboard;
