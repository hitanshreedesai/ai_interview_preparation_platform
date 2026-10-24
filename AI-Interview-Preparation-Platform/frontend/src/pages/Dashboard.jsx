import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FileText,
  Video,
  BarChart3,
  MessageSquare,
  Award,
  CheckCircle,
  HelpCircle,
  TrendingDown,
  ArrowRight,
  Calendar,
  AlertCircle,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [recentInterviews, setRecentInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [perfRes, historyRes] = await Promise.all([
          api.performance.get(),
          api.interview.getHistory(),
        ]);

        if (perfRes?.analytics) {
          setAnalytics(perfRes.analytics);
        }
        if (historyRes?.interviews) {
          setRecentInterviews(historyRes.interviews);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Could not load some dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your dashboard..." size="large" />;
  }

  // Calculate top weak topic or display count
  const weakTopicsCount = analytics?.weakTopics?.length || 0;
  const topWeakTopic = weakTopicsCount > 0 ? analytics.weakTopics[0].topic : 'None Identified';

  return (
    <div>
      {/* Dashboard Greeting Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          Welcome back, {user?.name || 'Candidate'}! 👋
        </h1>
        <p className="dashboard-subtitle">
          Continue your interview preparation and improve your performance.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Stats Cards */}
      <div className="stats-grid">
        <StatCard
          label="Interviews Completed"
          value={analytics?.totalInterviews || 0}
          icon={CheckCircle}
          color="#2563eb"
          bgColor="#eff6ff"
          description="Total finished mock rounds"
        />
        <StatCard
          label="Average Score"
          value={analytics?.averageScore ? `${analytics.averageScore} / 10` : '0.0 / 10'}
          icon={Award}
          color="#10b981"
          bgColor="#ecfdf5"
          description="Average score across rounds"
        />
        <StatCard
          label="Questions Answered"
          value={analytics?.questionsAttempted || 0}
          icon={HelpCircle}
          color="#8b5cf6"
          bgColor="#f5f3ff"
          description="Evaluated question submissions"
        />
        <StatCard
          label="Weak Topics"
          value={weakTopicsCount > 0 ? `${weakTopicsCount} Topics` : 'None'}
          icon={TrendingDown}
          color="#f59e0b"
          bgColor="#fffbeb"
          description={weakTopicsCount > 0 ? `Focus: ${topWeakTopic}` : 'All topics performing well'}
        />
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2 className="section-heading">Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/resume" className="action-card">
            <div className="action-icon-box" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
              <FileText size={22} />
            </div>
            <div>
              <h3 className="action-title">1. Upload Resume</h3>
              <p className="action-desc">
                Upload your latest PDF/DOC resume so AI can tailor relevant questions.
              </p>
            </div>
            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '4px', color: '#2563eb', fontSize: '0.85rem', fontWeight: 600 }}>
              <span>Upload now</span>
              <ArrowRight size={14} />
            </div>
          </Link>

          <Link to="/interview" className="action-card">
            <div className="action-icon-box" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
              <Video size={22} />
            </div>
            <div>
              <h3 className="action-title">2. Start Interview</h3>
              <p className="action-desc">
                Practice Technical or HR rounds with Gemini AI question generation.
              </p>
            </div>
            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontSize: '0.85rem', fontWeight: 600 }}>
              <span>Start session</span>
              <ArrowRight size={14} />
            </div>
          </Link>

          <Link to="/performance" className="action-card">
            <div className="action-icon-box" style={{ backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
              <BarChart3 size={22} />
            </div>
            <div>
              <h3 className="action-title">3. View Performance</h3>
              <p className="action-desc">
                Analyze your scoring trends, skill breakdown, and focus areas.
              </p>
            </div>
            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '4px', color: '#7c3aed', fontSize: '0.85rem', fontWeight: 600 }}>
              <span>Check analytics</span>
              <ArrowRight size={14} />
            </div>
          </Link>

          <Link to="/feedback" className="action-card">
            <div className="action-icon-box" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}>
              <MessageSquare size={22} />
            </div>
            <div>
              <h3 className="action-title">4. AI Feedback</h3>
              <p className="action-desc">
                Review detailed AI feedback reports, suggestions, and strengths.
              </p>
            </div>
            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '4px', color: '#d97706', fontSize: '0.85rem', fontWeight: 600 }}>
              <span>Review feedback</span>
              <ArrowRight size={14} />
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Interviews Section */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Recent Interviews</h2>
          {recentInterviews.length > 0 && (
            <Link to="/performance" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2563eb' }}>
              View all history →
            </Link>
          )}
        </div>

        {recentInterviews.length === 0 ? (
          <div className="empty-state">
            <Video className="empty-icon" />
            <h3 className="empty-title">No interviews completed yet.</h3>
            <p className="empty-desc">
              Get started by launching your first AI-evaluated mock interview session.
            </p>
            <Link to="/interview" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              Start Your First Interview
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Difficulty</th>
                  <th>Questions</th>
                  <th>Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentInterviews.slice(0, 5).map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} style={{ color: '#94a3b8' }} />
                        <span>{new Date(inv.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${inv.type === 'Technical' ? 'badge-blue' : 'badge-purple'}`}>
                        {inv.type}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-slate">
                        {inv.difficulty}
                      </span>
                    </td>
                    <td>
                      {inv.questionsAnswered} / {inv.totalQuestions}
                    </td>
                    <td>
                      <strong style={{ color: inv.averageScore >= 7 ? '#059669' : inv.averageScore >= 5 ? '#d97706' : '#dc2626' }}>
                        {inv.averageScore ? `${inv.averageScore} / 10` : '—'}
                      </strong>
                    </td>
                    <td>
                      <span className={`badge ${inv.status === 'completed' ? 'badge-green' : 'badge-amber'}`}>
                        {inv.status === 'completed' ? 'Completed' : 'In Progress'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
