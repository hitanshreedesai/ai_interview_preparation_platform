import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  BarChart3,
  Award,
  CheckCircle,
  HelpCircle,
  TrendingDown,
  Calendar,
  AlertCircle,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

const Performance = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const res = await api.performance.get();
      if (res?.analytics) {
        setAnalytics(res.analytics);
      }
    } catch (err) {
      console.error('Failed to load performance analytics:', err);
      setError('Unable to load performance metrics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Calculating performance analytics from database..." size="large" />;
  }

  const {
    totalInterviews = 0,
    averageScore = 0,
    bestScore = 0,
    questionsAttempted = 0,
    weakTopics = [],
    recentHistory = [],
    scoreTrend = [],
    typeBreakdown = { technical: 0, hr: 0 },
  } = analytics || {};

  // Simple pure SVG line / bar chart for score progression
  const renderTrendChart = () => {
    if (scoreTrend.length === 0) return null;

    const chartHeight = 160;
    const maxScore = 10;
    const points = scoreTrend.map((item, idx) => {
      const x = (idx / Math.max(1, scoreTrend.length - 1)) * 500 + 40;
      const y = chartHeight - (item.score / maxScore) * (chartHeight - 40) - 20;
      return { x, y, score: item.score, date: item.date };
    });

    const pathData = points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x},${pt.y}`, '');

    return (
      <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <svg viewBox="0 0 580 200" style={{ width: '100%', minWidth: '450px', height: '200px' }}>
          {/* Grid lines */}
          <line x1="40" y1="20" x2="550" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
          <text x="15" y="24" fill="#94a3b8" fontSize="11" fontWeight="600">10</text>
          
          <line x1="40" y1="80" x2="550" y2="80" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
          <text x="15" y="84" fill="#94a3b8" fontSize="11" fontWeight="600">6</text>

          <line x1="40" y1="140" x2="550" y2="140" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
          <text x="15" y="144" fill="#94a3b8" fontSize="11" fontWeight="600">2</text>

          {/* Area under curve */}
          {points.length > 1 && (
            <path
              d={`${pathData} L ${points[points.length - 1].x},160 L ${points[0].x},160 Z`}
              fill="rgba(37, 99, 235, 0.08)"
            />
          )}

          {/* Trend line */}
          {points.length > 1 ? (
            <path
              d={pathData}
              fill="none"
              stroke="#2563eb"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          ) : (
            <line x1="40" y1={points[0].y} x2="550" y2={points[0].y} stroke="#2563eb" strokeWidth="3" strokeDasharray="4 4" />
          )}

          {/* Points */}
          {points.map((pt, i) => (
            <g key={i}>
              <circle cx={pt.x} cy={pt.y} r="5" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" />
              <text x={pt.x} y={pt.y - 10} fill="#1e293b" fontSize="10" fontWeight="700" textAnchor="middle">
                {pt.score}/10
              </text>
              <text x={pt.x} y="180" fill="#64748b" fontSize="10" textAnchor="middle">
                {pt.date}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Performance Analytics</h1>
        <p className="dashboard-subtitle">
          Real-time metrics, score trends, and targeted weak-topic identification aggregated from your completed interview rounds.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="stats-grid">
        <StatCard
          label="Total Interviews"
          value={totalInterviews}
          icon={CheckCircle}
          color="#2563eb"
          bgColor="#eff6ff"
          description={`${typeBreakdown.technical} Tech / ${typeBreakdown.hr} HR`}
        />
        <StatCard
          label="Average Score"
          value={totalInterviews > 0 ? `${averageScore} / 10` : '0.0 / 10'}
          icon={Award}
          color="#10b981"
          bgColor="#ecfdf5"
          description="Across all completed sessions"
        />
        <StatCard
          label="Best Score"
          value={totalInterviews > 0 ? `${bestScore} / 10` : '0.0 / 10'}
          icon={TrendingUp}
          color="#8b5cf6"
          bgColor="#f5f3ff"
          description="Highest score recorded"
        />
        <StatCard
          label="Questions Attempted"
          value={questionsAttempted}
          icon={HelpCircle}
          color="#f59e0b"
          bgColor="#fffbeb"
          description="Evaluated question submissions"
        />
      </div>

      {totalInterviews === 0 ? (
        <div className="card empty-state" style={{ marginTop: '1.5rem' }}>
          <BarChart3 className="empty-icon" />
          <h3 className="empty-title">No performance data yet.</h3>
          <p className="empty-desc">
            Complete your first mock interview to generate live score progression and weak-topic analytics.
          </p>
          <Link to="/interview" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            Start an Interview Now
          </Link>
        </div>
      ) : (
        <>
          {/* Visual Trend & Weak Topics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Visual Analytics Chart */}
            <div className="card">
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={20} style={{ color: '#2563eb' }} />
                <span>Score Progression Trend</span>
              </h2>
              {renderTrendChart()}
            </div>

            {/* Weak Topics Identification */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingDown size={20} style={{ color: '#d97706' }} />
                  <span>Identified Weak Topics</span>
                </h2>
                <span className="badge badge-amber">Needs Focus</span>
              </div>

              {weakTopics.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic' }}>
                  No significant knowledge gaps identified yet. Great work!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  {weakTopics.map((topicItem, idx) => (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.9rem' }}>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{topicItem.topic}</span>
                        <span style={{ fontWeight: 700, color: topicItem.percentage > 40 ? '#dc2626' : '#d97706' }}>
                          {topicItem.percentage}%
                        </span>
                      </div>
                      <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${topicItem.percentage}%`,
                            height: '100%',
                            backgroundColor: topicItem.percentage > 40 ? '#ef4444' : '#f59e0b',
                            borderRadius: '9999px',
                            transition: 'width 0.4s ease',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Performance History Table */}
          <div className="card">
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Completed Sessions History
            </h2>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Interview Type</th>
                    <th>Difficulty</th>
                    <th>Questions</th>
                    <th>Average Score</th>
                    <th>Performance Level</th>
                  </tr>
                </thead>
                <tbody>
                  {recentHistory.map((inv) => (
                    <tr key={inv.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} style={{ color: '#94a3b8' }} />
                          <span>{new Date(inv.date).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${inv.type === 'Technical' ? 'badge-blue' : 'badge-purple'}`}>
                          {inv.type}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-slate">{inv.difficulty}</span>
                      </td>
                      <td>{inv.totalQuestions} Questions</td>
                      <td>
                        <strong style={{ color: inv.averageScore >= 7 ? '#059669' : inv.averageScore >= 5 ? '#d97706' : '#dc2626' }}>
                          {inv.averageScore} / 10
                        </strong>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: inv.averageScore >= 7 ? '#ecfdf5' : inv.averageScore >= 5 ? '#fffbeb' : '#fef2f2',
                            color: inv.averageScore >= 7 ? '#059669' : inv.averageScore >= 5 ? '#d97706' : '#dc2626',
                          }}
                        >
                          {inv.averageScore >= 8 ? 'Excellent' : inv.averageScore >= 6 ? 'Competent' : 'Needs Practice'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Performance;
