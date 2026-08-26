import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        // fallback to default demo user
      }
    }
    return {
      id: 'u-student-1',
      name: 'Alex Johnson',
      email: 'alex.student@placementcoach.ai',
      role: localStorage.getItem('demoRole') || 'student',
      targetCompanies: ['Google', 'Amazon', 'TCS'],
      targetRole: 'Software Development Engineer (SDE-1)'
    };
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || 'demo_jwt_token_2026');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role) {
      localStorage.setItem('demoRole', user.role);
    }
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  const switchRole = (newRole) => {
    localStorage.setItem('demoRole', newRole);
    if (newRole === 'admin') {
      const adminUser = {
        id: 'u-admin-1',
        name: 'System Administrator',
        email: 'admin@placementcoach.ai',
        role: 'admin',
        targetCompanies: [],
        targetRole: 'Administrator'
      };
      setUser(adminUser);
      localStorage.setItem('user', JSON.stringify(adminUser));
    } else {
      const studentUser = {
        id: 'u-student-1',
        name: 'Alex Johnson',
        email: 'alex.student@placementcoach.ai',
        role: 'student',
        targetCompanies: ['Google', 'Amazon', 'TCS'],
        targetRole: 'Software Development Engineer (SDE-1)'
      };
      setUser(studentUser);
      localStorage.setItem('user', JSON.stringify(studentUser));
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await API.post('/auth/login', { email, password });
      const data = res.data?.data || res.data;
      const userObj = data.user || data;
      const tokenStr = data.token || res.data?.token;

      if (tokenStr) {
        setToken(tokenStr);
        localStorage.setItem('token', tokenStr);
      }
      if (userObj) {
        setUser(userObj);
        localStorage.setItem('user', JSON.stringify(userObj));
        if (userObj.role) localStorage.setItem('demoRole', userObj.role);
      }
      setLoading(false);
      return { success: true, user: userObj, token: tokenStr };
    } catch (err) {
      setLoading(false);
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Login failed'
      };
    }
  };

  const register = async (userDataOrName, email, password, role = 'student') => {
    try {
      setLoading(true);
      const payload = typeof userDataOrName === 'object'
        ? userDataOrName
        : { name: userDataOrName, email, password, role };

      const res = await API.post('/auth/register', payload);
      const data = res.data?.data || res.data;
      const userObj = data.user || data;
      const tokenStr = data.token || res.data?.token;

      if (tokenStr) {
        setToken(tokenStr);
        localStorage.setItem('token', tokenStr);
      }
      if (userObj) {
        setUser(userObj);
        localStorage.setItem('user', JSON.stringify(userObj));
        if (userObj.role) localStorage.setItem('demoRole', userObj.role);
      }
      setLoading(false);
      return { success: true, user: userObj, token: tokenStr };
    } catch (err) {
      setLoading(false);
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
