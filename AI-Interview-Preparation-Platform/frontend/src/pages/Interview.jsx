import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Video,
  Play,
  CheckCircle,
  HelpCircle,
  Award,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Send,
  RotateCcw,
  BarChart2,
  FileCheck2,
  CheckCircle2,
  XCircle,
  ListOrdered,
} from 'lucide-react';

const Interview = () => {
  const navigate = useNavigate();

  // Screen state: 'setup' | 'active' | 'result'
  const [stage, setStage] = useState('setup');

  // Setup options
  const [interviewType, setInterviewType] = useState('Technical');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [useResume, setUseResume] = useState(false);
  const [hasResume, setHasResume] = useState(false);

  // Active interview state
  const [interviewId, setInterviewId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [answersMap, setAnswersMap] = useState({});

  // Result state
  const [summary, setSummary] = useState(null);

  // General loading & errors
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');

  // Check if user has uploaded a resume
  useEffect(() => {
    api.resume.get().then((res) => {
      if (res?.hasResume) {
        setHasResume(true);
        setUseResume(true);
      }
    }).catch(() => {});
  }, []);

  // START INTERVIEW
  const handleStartInterview = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setLoadingMessage('Gemini AI is generating your interview questions...');

    try {
      const res = await api.interview.start({
        type: interviewType,
        difficulty,
        totalQuestions: Number(totalQuestions),
        targetRole,
        useResume,
      });

      if (res?.success && res.interview) {
        setInterviewId(res.interview.id);
        setQuestions(res.interview.questions);
        setCurrentIndex(0);
        setUserAnswer('');
        setCurrentEvaluation(null);
        setAnswersMap({});
        setStage('active');
      } else {
        throw new Error(res.message || 'Failed to initialize interview');
      }
    } catch (err) {
      console.error('Start interview error:', err);
      setError(err.message || 'Could not start interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // SUBMIT CURRENT ANSWER
  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      setError('Please provide an answer before submitting.');
      return;
    }

    setError('');
    setIsSubmittingAnswer(true);

    try {
      const currentQ = questions[currentIndex];
      const res = await api.interview.submitAnswer({
        interviewId,
        questionIndex: currentIndex,
        questionId: currentQ.id,
        answer: userAnswer,
      });

      if (res?.success && res.evaluation) {
        setCurrentEvaluation(res.evaluation);
        setAnswersMap((prev) => ({
          ...prev,
          [currentIndex]: {
            answer: userAnswer,
            evaluation: res.evaluation,
          },
        }));
      }
    } catch (err) {
      console.error('Answer submission error:', err);
      setError(err.message || 'Failed to evaluate answer. Please try again.');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  // NEXT QUESTION OR FINISH
  const handleNextQuestion = () => {
    setError('');
    if (currentIndex + 1 < questions.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      // If already answered, load it; otherwise clear
      if (answersMap[nextIdx]) {
        setUserAnswer(answersMap[nextIdx].answer);
        setCurrentEvaluation(answersMap[nextIdx].evaluation);
      } else {
        setUserAnswer('');
        setCurrentEvaluation(null);
      }
    } else {
      // Completed all questions
      handleFinishInterview();
    }
  };

  // FINISH INTERVIEW
  const handleFinishInterview = async () => {
    setLoading(true);
    setLoadingMessage('Gemini AI is analyzing your overall interview performance...');
    setError('');

    try {
      const res = await api.interview.complete({ interviewId });
      if (res?.success && res.summary) {
        setSummary(res.summary);
        setStage('result');
      } else {
        throw new Error(res.message || 'Failed to finalize interview summary');
      }
    } catch (err) {
      console.error('Complete interview error:', err);
      setError(err.message || 'Failed to generate interview summary.');
    } finally {
      setLoading(false);
    }
  };

  // RESET AND START NEW INTERVIEW
  const handleReset = () => {
    setStage('setup');
    setInterviewId(null);
    setQuestions([]);
    setCurrentIndex(0);
    setUserAnswer('');
    setCurrentEvaluation(null);
    setAnswersMap({});
    setSummary(null);
    setError('');
  };

  // RENDER: LOADING STATE
  if (loading) {
    return <LoadingSpinner message={loadingMessage} size="large" />;
  }

  // ==========================================
  // STAGE 1: SETUP
  // ==========================================
  if (stage === 'setup') {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="dashboard-header">
          <h1 className="dashboard-title">Start AI Interview</h1>
          <p className="dashboard-subtitle">
            Configure your mock session parameters. Google Gemini will dynamically generate role-specific questions and evaluate your responses in real time.
          </p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <div className="card">
          <form onSubmit={handleStartInterview}>
            {/* Interview Type Selection */}
            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
                1. Select Interview Type
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  {
                    id: 'Technical',
                    title: 'Technical Round',
                    desc: 'DSA, JavaScript, React, Backend, System Architecture & DBMS',
                    badge: 'Coding & Concepts',
                  },
                  {
                    id: 'HR',
                    title: 'HR / Behavioral Round',
                    desc: 'STAR method, situational judgment, culture fit & leadership',
                    badge: 'Behavioral',
                  },
                ].map((type) => (
                  <div
                    key={type.id}
                    onClick={() => setInterviewType(type.id)}
                    style={{
                      border: `2px solid ${interviewType === type.id ? '#2563eb' : '#e2e8f0'}`,
                      backgroundColor: interviewType === type.id ? '#eff6ff' : '#ffffff',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{type.title}</strong>
                      <span className={`badge ${interviewType === type.id ? 'badge-blue' : 'badge-slate'}`}>
                        {type.badge}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.4 }}>
                      {type.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Role */}
            <div className="form-group">
              <label className="form-label">Target Role / Designation</label>
              <input
                type="text"
                className="form-input"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Full Stack Developer, SDE-1, Frontend Engineer"
              />
            </div>

            {/* Difficulty Selection */}
            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
                2. Select Difficulty Level
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {['Beginner', 'Intermediate', 'Advanced'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className="btn"
                    style={{
                      backgroundColor: difficulty === diff ? '#1d4ed8' : '#f8fafc',
                      color: difficulty === diff ? '#ffffff' : '#334155',
                      border: `1.5px solid ${difficulty === diff ? '#1d4ed8' : '#cbd5e1'}`,
                      padding: '0.75rem 1rem',
                    }}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Number of Questions */}
            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
                3. Number of Questions
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {[5, 10, 15].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setTotalQuestions(count)}
                    className="btn"
                    style={{
                      backgroundColor: totalQuestions === count ? '#0f172a' : '#f8fafc',
                      color: totalQuestions === count ? '#ffffff' : '#334155',
                      border: `1.5px solid ${totalQuestions === count ? '#0f172a' : '#cbd5e1'}`,
                      padding: '0.75rem 1rem',
                    }}
                  >
                    {count} Questions
                  </button>
                ))}
              </div>
            </div>

            {/* Use Resume Checkbox */}
            <div
              style={{
                padding: '1rem 1.25rem',
                backgroundColor: hasResume ? '#f0fdf4' : '#f8fafc',
                border: `1px solid ${hasResume ? '#bbf7d0' : '#e2e8f0'}`,
                borderRadius: 'var(--radius-md)',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
              }}
            >
              <input
                id="use-resume-toggle"
                type="checkbox"
                checked={useResume}
                onChange={(e) => setUseResume(e.target.checked)}
                disabled={!hasResume}
                style={{ width: '18px', height: '18px', cursor: hasResume ? 'pointer' : 'not-allowed' }}
              />
              <label htmlFor="use-resume-toggle" style={{ cursor: hasResume ? 'pointer' : 'default', fontSize: '0.9rem', color: '#0f172a' }}>
                {hasResume ? (
                  <span>
                    <strong>Personalize with my uploaded resume:</strong> Gemini AI will craft questions directly evaluating the projects, tools, and experience listed on your resume.
                  </span>
                ) : (
                  <span style={{ color: '#64748b' }}>
                    No resume uploaded yet. <Link to="/resume" style={{ color: '#2563eb', fontWeight: 600 }}>Upload a resume</Link> to enable custom question tailoring.
                  </span>
                )}
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
            >
              <Play size={18} />
              <span>Start Interview</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // STAGE 2: ACTIVE INTERVIEW (ONE QUESTION AT A TIME)
  // ==========================================
  if (stage === 'active' && questions.length > 0) {
    const currentQ = questions[currentIndex];
    const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);
    const isAnswerEvaluated = !!currentEvaluation;

    return (
      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        {/* Top Progress & Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-blue">{interviewType} Round</span>
            <span className="badge badge-slate">{difficulty}</span>
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2563eb' }}>
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="interview-progress-bar-container">
          <div
            className="interview-progress-bar-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Question Box */}
        <div className="question-card">
          <div className="question-header">
            <span className="badge badge-purple" style={{ textTransform: 'uppercase' }}>
              Topic: {currentQ.topic || 'General'}
            </span>
            <span style={{ fontSize: '0.825rem', color: '#64748b' }}>
              Question ID #{currentQ.id}
            </span>
          </div>

          <h2 className="question-title">
            "{currentQ.question}"
          </h2>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Your Answer</span>
              <span style={{ fontSize: '0.775rem', color: '#64748b', fontWeight: 400 }}>
                {userAnswer.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </label>
            <textarea
              className="form-textarea answer-textarea"
              placeholder="Type your structured answer here. Be thorough and provide technical explanations or examples..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={isSubmittingAnswer || isAnswerEvaluated}
            />
          </div>

          {/* AI Immediate Answer Evaluation Preview */}
          {currentEvaluation && (
            <div className="feedback-preview-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={18} style={{ color: '#2563eb' }} />
                  <strong style={{ fontSize: '1rem', color: '#0f172a' }}>AI Evaluation Feedback</strong>
                </div>
                <span
                  className="badge"
                  style={{
                    backgroundColor: currentEvaluation.score >= 7 ? '#dcfce7' : currentEvaluation.score >= 5 ? '#fef3c7' : '#fee2e2',
                    color: currentEvaluation.score >= 7 ? '#15803d' : currentEvaluation.score >= 5 ? '#b45309' : '#b91c1c',
                    fontSize: '0.85rem',
                  }}
                >
                  Score: {currentEvaluation.score} / 10 ({currentEvaluation.correctness})
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                <p>
                  <strong>Strengths:</strong> {currentEvaluation.strengths}
                </p>
                <p>
                  <strong>Areas to Improve:</strong> {currentEvaluation.improvements}
                </p>
                <p style={{ color: '#475569', fontStyle: 'italic', marginTop: '0.25rem' }}>
                  💡 {currentEvaluation.feedback}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            {!isAnswerEvaluated ? (
              <>
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="btn btn-outline"
                >
                  Skip Question
                </button>
                <button
                  type="button"
                  onClick={handleSubmitAnswer}
                  className="btn btn-primary"
                  disabled={isSubmittingAnswer || !userAnswer.trim()}
                >
                  {isSubmittingAnswer ? (
                    <>Evaluating with Gemini AI...</>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Submit Answer</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="btn btn-primary"
              >
                <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'Finish & View Results'}</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // STAGE 3: RESULT SCREEN
  // ==========================================
  if (stage === 'result' && summary) {
    return (
      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        {/* Completion Header Card */}
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
            }}
          >
            <CheckCircle size={36} />
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
            Interview Completed!
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>
            Here is your comprehensive AI performance analysis for the {summary.interviewType} session.
          </p>

          <div
            style={{
              marginTop: '1.5rem',
              display: 'inline-block',
              backgroundColor: '#eff6ff',
              padding: '0.65rem 1.75rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid #bfdbfe',
            }}
          >
            <span style={{ fontSize: '0.9rem', color: '#1e40af', fontWeight: 600 }}>
              Overall Performance Score:
            </span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1d4ed8', marginLeft: '0.5rem' }}>
              {summary.averageScore} / 10
            </span>
          </div>
        </div>

        {/* Metric Badges Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Questions
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
              {summary.totalQuestions}
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Questions Answered
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563eb', marginTop: '0.25rem' }}>
              {summary.questionsAnswered}
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Correct / Strong Answers
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669', marginTop: '0.25rem' }}>
              {summary.correctAnswers}
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Points
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#7c3aed', marginTop: '0.25rem' }}>
              {summary.totalScore}
            </div>
          </div>
        </div>

        {/* AI Detailed Feedback Breakdown */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} style={{ color: '#2563eb' }} />
            <span>AI Evaluation Breakdown</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Strengths */}
            <div style={{ backgroundColor: '#f0fdf4', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#15803d', fontWeight: 700, marginBottom: '0.75rem' }}>
                <CheckCircle2 size={18} />
                <span>Strengths</span>
              </div>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem', color: '#166534' }}>
                {summary.strengths?.map((str, idx) => (
                  <li key={idx}>{str}</li>
                ))}
              </ul>
            </div>

            {/* Areas to Improve */}
            <div style={{ backgroundColor: '#fff7ed', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #fed7aa' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#c2410c', fontWeight: 700, marginBottom: '0.75rem' }}>
                <XCircle size={18} />
                <span>Areas to Improve</span>
              </div>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem', color: '#9a3412' }}>
                {summary.weaknesses?.map((weak, idx) => (
                  <li key={idx}>{weak}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actionable Suggestions */}
          {summary.suggestions?.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                Actionable Recommendations
              </h3>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem', color: '#475569' }}>
                {summary.suggestions.map((sug, idx) => (
                  <li key={idx}>{sug}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Weak Topics */}
          {summary.weakTopics?.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
                Identified Weak Topics to Review
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {summary.weakTopics.map((wt, idx) => (
                  <span key={idx} className="badge badge-amber" style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}>
                    {wt.topic} ({wt.percentage}% weakness)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
          <button
            onClick={handleReset}
            className="btn btn-secondary"
          >
            <RotateCcw size={16} />
            <span>Start Another Interview</span>
          </button>

          <button
            onClick={() => navigate('/feedback')}
            className="btn btn-primary"
          >
            <span>View Detailed Feedback</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default Interview;
