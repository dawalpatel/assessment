import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => {
  return (
    <div className="stat-card">
      <div className={`stat-icon stat-icon-${color}`}>
        {Icon && <Icon size={26} />}
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{title}</div>
        {subtitle && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
