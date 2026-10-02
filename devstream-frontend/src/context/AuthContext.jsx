import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('devstream_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('devstream_token') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && currentUser) {
      localStorage.setItem('devstream_token', token);
      localStorage.setItem('devstream_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('devstream_token');
      localStorage.removeItem('devstream_user');
    }
  }, [token, currentUser]);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const data = await authService.login(username, password);
      // data contains { accessToken, tokenType, id, username, email, githubUsername, roles }
      setToken(data.accessToken);
      const user = {
        id: data.id,
        username: data.username,
        email: data.email,
        githubUsername: data.githubUsername,
        roles: data.roles || [],
      };
      setCurrentUser(user);
      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed. Please verify credentials.';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await authService.register(userData);
      setToken(data.accessToken);
      const user = {
        id: data.id,
        username: data.username,
        email: data.email,
        githubUsername: data.githubUsername,
        roles: data.roles || [],
      };
      setCurrentUser(user);
      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('devstream_token');
    localStorage.removeItem('devstream_user');
  };

  const value = {
    currentUser,
    token,
    isAuthenticated: Boolean(token && currentUser),
    login,
    register,
    logout,
    loading,
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
