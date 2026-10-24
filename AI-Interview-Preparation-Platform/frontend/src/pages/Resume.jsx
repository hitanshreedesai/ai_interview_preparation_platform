import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  HardDrive,
  FileCheck,
  RefreshCw,
} from 'lucide-react';

const Resume = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentResume, setCurrentResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchCurrentResume();
  }, []);

  const fetchCurrentResume = async () => {
    try {
      setLoading(true);
      const res = await api.resume.get();
      if (res?.hasResume && res.resume) {
        setCurrentResume(res.resume);
      } else {
        setCurrentResume(null);
      }
    } catch (err) {
      console.error('Failed to fetch resume status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setErrorMessage('');
    setSuccessMessage('');
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    const validExtensions = ['.pdf', '.doc', '.docx'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      setErrorMessage('Only PDF, DOC and DOCX files are allowed.');
      setSelectedFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 10MB limit.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const formData = new FormData();
    formData.append('resume', selectedFile);

    try {
      const res = await api.resume.upload(formData);
      setSuccessMessage('Resume uploaded successfully! AI will now incorporate your profile in interviews.');
      setSelectedFile(null);
      await fetchCurrentResume();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to upload resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  if (loading) {
    return <LoadingSpinner message="Checking resume status..." size="large" />;
  }

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Upload Your Resume</h1>
        <p className="dashboard-subtitle">
          Upload your resume in PDF, DOC, or DOCX format to personalize AI interview questions based on your actual skills and projects.
        </p>
      </div>

      {/* Status Messages */}
      {successMessage && (
        <div className="alert alert-success">
          <CheckCircle size={20} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-danger">
          <AlertCircle size={20} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: currentResume ? '1.4fr 1fr' : '1fr', gap: '1.5rem' }}>
        {/* Upload Box Card */}
        <div className="card">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
            {currentResume ? 'Replace or Upload New Resume' : 'Select Resume File'}
          </h2>

          <form onSubmit={handleUpload}>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${dragActive ? '#2563eb' : '#cbd5e1'}`,
                backgroundColor: dragActive ? '#eff6ff' : '#f8fafc',
                borderRadius: 'var(--radius-lg)',
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onClick={() => document.getElementById('resume-file-input').click()}
            >
              <input
                id="resume-file-input"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                }}
              >
                <UploadCloud size={28} />
              </div>

              <p style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem', marginBottom: '0.25rem' }}>
                Drag and drop your resume file here
              </p>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Supported formats: <strong>PDF, DOC, DOCX</strong> (Up to 10MB)
              </p>

              <button
                type="button"
                className="btn btn-secondary"
                style={{ pointerEvents: 'none' }}
              >
                Browse Files
              </button>
            </div>

            {/* Selected File Preview */}
            {selectedFile && (
              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '1rem',
                  backgroundColor: '#f1f5f9',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FileText size={24} style={{ color: '#2563eb' }} />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.925rem', color: '#0f172a' }}>
                      {selectedFile.name}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <span className="badge badge-blue">Ready to Upload</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1.25rem', padding: '0.85rem' }}
              disabled={!selectedFile || uploading}
            >
              {uploading ? (
                <>
                  <RefreshCw size={18} className="spin" />
                  <span>Uploading to Server...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={18} />
                  <span>Upload Resume</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Current Uploaded Resume Status Card */}
        {currentResume && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <FileCheck size={22} style={{ color: '#059669' }} />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Active Resume</h2>
            </div>

            <div
              style={{
                padding: '1.25rem',
                backgroundColor: '#f8fafc',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#ecfdf5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <FileText size={22} />
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <h3
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={currentResume.originalName}
                  >
                    {currentResume.originalName}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.4rem', color: '#64748b', fontSize: '0.775rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <HardDrive size={13} />
                      {formatFileSize(currentResume.fileSize)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} />
                      {new Date(currentResume.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 'auto', backgroundColor: '#eff6ff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #bfdbfe' }}>
              <p style={{ fontSize: '0.825rem', color: '#1e40af', lineHeight: 1.5 }}>
                💡 <strong>AI Personalization Active:</strong> When starting an interview, check <em>"Use uploaded resume context"</em> to simulate questions targeted directly at your listed tech stack and projects!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resume;
