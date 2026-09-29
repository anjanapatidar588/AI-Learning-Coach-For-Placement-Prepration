import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  // Restore authenticated session from backend on mount or refresh
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const res = await API.get('/auth/me');
        if (res.data?.success && res.data?.user) {
          const authUser = res.data.user;
          setUser(authUser);
          localStorage.setItem('user', JSON.stringify(authUser));

          if (res.data?.profile) {
            setProfile(res.data.profile);
          } else if (authUser.role === 'student') {
            await fetchProfile();
          }
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session verification failed, logging out:', err.response?.data?.message || err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get('/student/profile');
      if (res.data?.success && res.data?.data) {
        setProfile(res.data.data);
        return res.data.data;
      }
    } catch (err) {
      // Profile might not exist yet or user is admin
    }
    return null;
  };

  /**
   * Authoritative backend login.
   * Derives user role strictly from backend DB response.
   */
  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await API.post('/auth/login', { email, password });
      const data = res.data;

      if (data?.success && data?.token && data?.user) {
        const { token: tokenStr, user: userObj } = data;

        localStorage.setItem('token', tokenStr);
        localStorage.setItem('user', JSON.stringify(userObj));
        setToken(tokenStr);
        setUser(userObj);

        let userProfile = data.profile || null;
        if (userObj.role === 'student') {
          if (!userProfile) {
            userProfile = await fetchProfile();
          } else {
            setProfile(userProfile);
          }
        }

        setLoading(false);
        return { success: true, user: userObj, token: tokenStr, profile: userProfile };
      }

      setLoading(false);
      return {
        success: false,
        message: data?.message || 'Login failed. Invalid response from server.'
      };
    } catch (err) {
      setLoading(false);
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Login failed'
      };
    }
  };

  /**
   * User registration (Student or Admin).
   * Directly supports role selection without admin key requirement.
   */
  const register = async (userDataOrName, email, password, role = 'student') => {
    try {
      setLoading(true);
      let payload;
      if (typeof userDataOrName === 'object') {
        payload = { ...userDataOrName };
      } else {
        payload = { name: userDataOrName, email, password, role };
      }

      // Ensure no admin key fields are sent
      delete payload.adminKey;
      delete payload.adminInviteCode;

      const res = await API.post('/auth/signup', payload);
      const data = res.data;

      if (data?.success && data?.user) {
        const { token: tokenStr, user: userObj } = data;
        let userProfile = data.profile || null;

        if (tokenStr) {
          localStorage.setItem('token', tokenStr);
          localStorage.setItem('user', JSON.stringify(userObj));
          setToken(tokenStr);
          setUser(userObj);
          if (userObj.role === 'student') {
            if (!userProfile) {
              userProfile = await fetchProfile();
            } else {
              setProfile(userProfile);
            }
          }
        }

        setLoading(false);
        return { success: true, user: userObj, token: tokenStr, profile: userProfile };
      }

      setLoading(false);
      return {
        success: false,
        message: data?.message || 'Registration failed.'
      };
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
    setProfile(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('demoRole');
    localStorage.removeItem('pathpilot_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, profile, loading, login, register, logout, fetchProfile, setProfile }}>
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
