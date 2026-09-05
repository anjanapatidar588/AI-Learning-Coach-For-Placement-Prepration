import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: 'u-student-1',
    name: 'Alex Johnson',
    email: 'alex.student@placementcoach.ai',
    role: localStorage.getItem('demoRole') || 'student',
    targetCompanies: ['Google', 'Amazon', 'TCS'],
    targetRole: 'Software Development Engineer (SDE-1)'
  });
  const [token, setToken] = useState(localStorage.getItem('token') || 'demo_jwt_token_2026');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Save demo role
    localStorage.setItem('demoRole', user.role);
  }, [user.role]);

  const switchRole = (newRole) => {
    localStorage.setItem('demoRole', newRole);
    if (newRole === 'admin') {
      setUser({
        id: 'u-admin-1',
        name: 'System Administrator',
        email: 'admin@placementcoach.ai',
        role: 'admin',
        targetCompanies: [],
        targetRole: 'Administrator'
      });
    } else {
      setUser({
        id: 'u-student-1',
        name: 'Alex Johnson',
        email: 'alex.student@placementcoach.ai',
        role: 'student',
        targetCompanies: ['Google', 'Amazon', 'TCS'],
        targetRole: 'Software Development Engineer (SDE-1)'
      });
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await API.post('/auth/login', { email, password });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('demoRole', res.data.user.role);
      }
      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const res = await API.post('/auth/register', userData);
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('demoRole', res.data.user.role);
      }
      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
