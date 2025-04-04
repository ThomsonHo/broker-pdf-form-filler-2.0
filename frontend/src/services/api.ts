import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Dashboard API calls
export const fetchDashboardData = async () => {
  const [metricsResponse, quickLinksResponse] = await Promise.all([
    api.get('/dashboard/metrics/'),
    api.get('/dashboard/quick-links/'),
  ]);

  return {
    metrics: metricsResponse.data.metrics,
    quick_links: quickLinksResponse.data,
    user_quota: metricsResponse.data.user_quota,
  };
}; 