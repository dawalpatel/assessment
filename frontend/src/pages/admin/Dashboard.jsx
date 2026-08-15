import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import { Users, Building2, Star, PlusCircle, ArrowRight, ShieldCheck } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        if (res.data && res.data.data) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>System Administration</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Overview of platform metrics, registered users, stores, and ratings.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Registered Users"
          value={loading ? '...' : stats.totalUsers}
          icon={Users}
          color="blue"
          subtitle="Admins, Store Owners, and Users"
        />
        <StatCard
          title="Total Registered Stores"
          value={loading ? '...' : stats.totalStores}
          icon={Building2}
          color="pink"
          subtitle="Stores listed for rating"
        />
        <StatCard
          title="Total Ratings Submitted"
          value={loading ? '...' : stats.totalRatings}
          icon={Star}
          color="amber"
          subtitle="Overall community reviews"
        />
      </div>

      {/* Quick Action Navigation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} color="var(--primary)" /> Manage Users
            </h3>
            <Link to="/admin/users" className="btn btn-secondary btn-sm" id="view-users-btn">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Filter, sort, and create new users with custom roles (Admin, Store Owner, Normal User). View user details including owner store ratings.
          </p>
          <Link to="/admin/users" className="btn btn-primary" style={{ width: '100%' }}>
            Go to User Management
          </Link>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={20} color="var(--secondary)" /> Manage Stores
            </h3>
            <Link to="/admin/stores" className="btn btn-secondary btn-sm" id="view-stores-btn">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Register new retail stores, assign them to store owners, and monitor real-time computed average ratings across all listings.
          </p>
          <Link to="/admin/stores" className="btn btn-primary" style={{ width: '100%' }}>
            Go to Store Management
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
