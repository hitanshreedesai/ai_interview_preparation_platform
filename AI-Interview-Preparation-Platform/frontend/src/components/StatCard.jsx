import React from 'react';

const StatCard = ({
  label,
  value,
  icon: Icon,
  color = '#2563eb',
  bgColor = '#eff6ff',
  description,
}) => {
  return (
    <div className="card stat-card">
      <div
        className="stat-icon-wrapper"
        style={{ backgroundColor: bgColor, color: color }}
      >
        {Icon && <Icon size={26} />}
      </div>
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        {description && (
          <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
            {description}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
