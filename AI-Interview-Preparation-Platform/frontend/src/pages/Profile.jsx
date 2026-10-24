import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  User,
  Mail,
  Calendar,
  FileCheck,
  Video,
  LogOut,
  ShieldCheck,
  Award,
  AlertCircle,
} from 'lucide-react';

const Profile = () => {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.profile.get();
      if (res?.profile) {
        setProfile(res.profile);
      }
    } catch (err) {
      console.error('Failed to load profile details:', err);
      setError('Could not retrieve latest profile information.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <LoadingSpinner message="Loading profile information..." size="large" />;
  }

  const displayName = profile?.name || authUser?.name || 'Candidate';
  const displayEmail = profile?.email || authUser?.email || 'N/A';
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Recent Member';

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="dashboard-header">
        <h1 className="dashboard-title">User Profile</h1>
        <p className="dashboard-subtitle">
          Manage your account credentials, view placement preparation stats, and sign out of your session.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Profile Info Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          {/* Profile Icon / Avatar */}
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
              color: '#ffffff',
              fontSize: '2rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(30, 64, 175, 0.25)',
              border: '4px solid #eff6ff',
            }}
          >
            {getInitials(displayName)}
          </div>

          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
              {displayName}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.925rem', marginTop: '0.25rem' }}>
              <Mail size={16} />
              <span>{displayEmail}</span>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <span className="badge badge-blue">Registered Candidate</span>
            </div>
          </div>
        </div>

        {/* Account Information Details */}
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
          Account Information
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
              <Calendar size={14} />
              <span>Member Since</span>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.25rem' }}>
              {memberSince}
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
              <Video size={14} />
              <span>Completed Interviews</span>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#2563eb', marginTop: '0.25rem' }}>
              {profile?.totalInterviewsCompleted || 0} Sessions
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
              <FileCheck size={14} />
              <span>Resume Status</span>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: profile?.hasResume ? '#059669' : '#d97706', marginTop: '0.25rem' }}>
              {profile?.hasResume ? 'Uploaded & Active' : 'Not Uploaded'}
            </div>
          </div>
        </div>
      </div>

      {/* Security Information Card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <ShieldCheck size={20} style={{ color: '#059669' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Security & Authentication</h3>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.5 }}>
          Your password is cryptographic-salted and securely hashed using bcryptjs. Authentication is verified statelessly via signed JSON Web Tokens (JWT).
        </p>
      </div>

      {/* Clearly Visible Logout Button at the bottom as required */}
      <div
        className="card"
        style={{
          border: '1.5px solid #fecaca',
          backgroundColor: '#fff5f5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1.5rem',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#991b1b' }}>
            Sign Out of Your Account
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#b91c1c', marginTop: '0.2rem' }}>
            This will terminate your active session and redirect you to the login screen.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-danger"
          style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;
