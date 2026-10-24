import React from 'react';
import { Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onToggleSidebar }) => {
  const { user } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          onClick={onToggleSidebar}
          className="mobile-menu-btn"
          aria-label="Toggle navigation menu"
        >
          <Menu size={24} />
        </button>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>
          Placement Preparation Portal
        </span>
      </div>

      <div className="navbar-user">
        <div className="user-avatar-circle">
          {getInitials(user?.name)}
        </div>
        <div className="user-info-text">
          <span className="user-name-title">{user?.name || 'Candidate'}</span>
          <span className="user-role-subtitle">Student / Fresher</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
