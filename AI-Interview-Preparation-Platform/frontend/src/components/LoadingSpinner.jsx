import React from 'react';

const LoadingSpinner = ({ message = 'Loading...', size = 'medium' }) => {
  const sizeMap = {
    small: { width: '20px', height: '20px', border: '2px' },
    medium: { width: '36px', height: '36px', border: '3px' },
    large: { width: '56px', height: '56px', border: '4px' },
  };

  const currentSize = sizeMap[size] || sizeMap.medium;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1rem',
      gap: '1rem',
    }}>
      <div
        style={{
          width: currentSize.width,
          height: currentSize.height,
          border: `${currentSize.border} solid #e2e8f0`,
          borderTopColor: '#2563eb',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      {message && (
        <p style={{
          color: '#64748b',
          fontSize: '0.9rem',
          fontWeight: 500,
        }}>
          {message}
        </p>
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
