import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// Create a logger function
const log = (message: string, data?: any) => {
  console.log(`[API Service] ${message}`, data || '');
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Enable sending cookies
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  log('Request interceptor - Token:', token ? 'Present' : 'Missing');
  log('Request URL:', config.url);
  log('Full URL:', `${config.baseURL}${config.url}`);
  log('Request method:', config.method?.toUpperCase());
  log('Request headers:', config.headers);
  log('Request data:', config.data);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    log('Added Authorization header with token');
  } else {
    log('No token found in localStorage');
  }
  
  // Normalize URL
  if (config.url) {
    config.url = config.url.replace(/^\/+/g, '');
    
    if (!config.url.includes('?') && !config.url.endsWith('/')) {
      config.url = `${config.url}/`;
    }
    
    log('Normalized URL:', config.url);
  }
  
  return config;
}, (error) => {
  log('Request interceptor error:', error);
  return Promise.reject(error);
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    log('Response received:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers,
    });
    return response;
  },
  (error) => {
    if (error.response) {
      log('Response error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
      });
      
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        log('Unauthorized access - clearing token');
        localStorage.removeItem('access_token');
        // Optionally redirect to login page
        window.location.href = '/login';
      }
    } else if (error.request) {
      log('No response received:', error.request);
    } else {
      log('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

// Dashboard API calls
export const fetchDashboardData = async () => {
  try {
    log('Fetching dashboard data');
    const [metricsResponse, quickLinksResponse] = await Promise.all([
      api.get('/api/dashboard/metrics/'),
      api.get('/api/dashboard/quick-links/'),
    ]);

    log('Dashboard data received');
    return {
      metrics: metricsResponse.data,
      quick_links: quickLinksResponse.data,
      user_quota: metricsResponse.data.user_quota,
    };
  } catch (error) {
    log('Error fetching dashboard data:', error);
    throw error;
  }
};  