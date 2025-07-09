import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://flight-booking-zeez.onrender.com';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid, clear it
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      
      // Redirect to login if not already there
      if (typeof window !== 'undefined' && window.location.pathname !== '/auth') {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export default api; 