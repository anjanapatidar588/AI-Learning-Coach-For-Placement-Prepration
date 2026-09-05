import axios from 'axios';

const API = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Demo mode fallback role header
  const activeRole = localStorage.getItem('demoRole') || 'student';
  config.headers['x-mock-role'] = activeRole;

  return config;
});

export default API;
