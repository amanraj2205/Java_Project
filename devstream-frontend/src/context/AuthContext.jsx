import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

// Safe JWT Payload decoder with base64url decoding
export const parseJwt = (token) => {
  try {
    if (!token) return null;
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse JWT token:', e);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('devstream_token') || null);
  
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('devstream_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Sync token and user in localStorage
  useEffect(() => {
    if (token && currentUser) {
      localStorage.setItem('devstream_token', token);
      localStorage.setItem('devstream_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('devstream_token');
      localStorage.removeItem('devstream_user');
    }
  }, [token, currentUser]);

  // Compute roles from currentUser or directly from decoded JWT
  const roles = React.useMemo(() => {
    if (!token) return ['ROLE_GUEST'];
    const decoded = parseJwt(token);
    if (decoded && Array.isArray(decoded.roles) && decoded.roles.length > 0) {
      return decoded.roles;
    }
    if (currentUser && Array.isArray(currentUser.roles) && currentUser.roles.length > 0) {
      return currentUser.roles;
    }
    return ['ROLE_GUEST'];
  }, [token, currentUser]);

  const hasRole = (role) => roles.includes(role);
  const hasAnyRole = (roleList) => roleList.some((r) => roles.includes(r));

  const isModerator = hasRole('ROLE_MODERATOR');
  const isStudent = hasRole('ROLE_STUDENT_AUTHOR');
  const isGuest = !token || hasRole('ROLE_GUEST') || (!isModerator && !isStudent);

  // Helper function to resolve post-login redirect path
  const getRedirectPath = (userRoles = roles) => {
    if (userRoles.includes('ROLE_MODERATOR')) {
      return '/moderator/dashboard';
    }
    if (userRoles.includes('ROLE_STUDENT_AUTHOR')) {
      return '/student/dashboard';
    }
    return '/';
  };

  const login = async (username, password) => {
    setLoading(true);
    try {
      const data = await authService.login(username, password);
      // data contains { accessToken, tokenType, id, username, email, githubUsername, roles }
      setToken(data.accessToken);

      const decoded = parseJwt(data.accessToken);
      const effectiveRoles = (decoded && decoded.roles) || data.roles || ['ROLE_STUDENT_AUTHOR'];

      const user = {
        id: data.id,
        username: data.username,
        email: data.email,
        githubUsername: data.githubUsername,
        roles: effectiveRoles,
      };

      setCurrentUser(user);
      const redirectPath = getRedirectPath(effectiveRoles);
      return { success: true, user, redirectPath };
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

      const decoded = parseJwt(data.accessToken);
      const effectiveRoles = (decoded && decoded.roles) || data.roles || ['ROLE_STUDENT_AUTHOR'];

      const user = {
        id: data.id,
        username: data.username,
        email: data.email,
        githubUsername: data.githubUsername,
        roles: effectiveRoles,
      };

      setCurrentUser(user);
      const redirectPath = getRedirectPath(effectiveRoles);
      return { success: true, user, redirectPath };
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
    roles,
    isAuthenticated: Boolean(token && currentUser),
    hasRole,
    hasAnyRole,
    isModerator,
    isStudent,
    isGuest,
    getRedirectPath,
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
