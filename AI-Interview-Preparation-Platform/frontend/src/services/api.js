const API_BASE = '/api';

/**
 * Standard HTTP request wrapper with JWT token handling
 */
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('interview_ai_token');

  const headers = {
    ...options.headers,
  };

  // If body is NOT FormData, set application/json
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // If unauthorized, clear token
      if (response.status === 401) {
        localStorage.removeItem('interview_ai_token');
        localStorage.removeItem('interview_ai_user');
      }
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please try again.');
    }
    throw error;
  }
};

export const api = {
  // Authentication
  auth: {
    register: (userData) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    login: (credentials) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
  },

  // Resume
  resume: {
    upload: (formData) =>
      request('/resume/upload', {
        method: 'POST',
        body: formData,
      }),
    get: () => request('/resume', { method: 'GET' }),
  },

  // Interview
  interview: {
    start: (params) =>
      request('/interview/start', {
        method: 'POST',
        body: JSON.stringify(params),
      }),
    submitAnswer: (payload) =>
      request('/interview/answer', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    complete: (payload) =>
      request('/interview/complete', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    getHistory: () => request('/interview/history', { method: 'GET' }),
  },

  // Performance
  performance: {
    get: () => request('/performance', { method: 'GET' }),
  },

  // Feedback
  feedback: {
    get: () => request('/feedback', { method: 'GET' }),
  },

  // Profile
  profile: {
    get: () => request('/profile', { method: 'GET' }),
  },
};

export default api;
