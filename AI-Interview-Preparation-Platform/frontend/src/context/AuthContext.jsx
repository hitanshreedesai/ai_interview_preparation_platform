import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on load
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('interview_ai_token');
      const storedUser = localStorage.getItem('interview_ai_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to restore session from localStorage:', e);
      localStorage.removeItem('interview_ai_token');
      localStorage.removeItem('interview_ai_user');
    } finally {
      setLoading(false);
    }
  }, []);

  // Register function
  const register = async (name, email, password, confirmPassword) => {
    const data = await api.auth.register({ name, email, password, confirmPassword });
    if (data.token && data.user) {
      localStorage.setItem('interview_ai_token', data.token);
      localStorage.setItem('interview_ai_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  // Login function
  const login = async (email, password) => {
    const data = await api.auth.login({ email, password });
    if (data.token && data.user) {
      localStorage.setItem('interview_ai_token', data.token);
      localStorage.setItem('interview_ai_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('interview_ai_token');
    localStorage.removeItem('interview_ai_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
