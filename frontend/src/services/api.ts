import axios from 'axios';

// Function to dynamically determine the API URL based on the current environment
const getApiUrl = () => {
  // In development on localhost
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:8001/api';
  }
  
  // For Replit environment, use the relative API path
  // This is the simplest and most reliable approach in Replit's proxied env
  return '/api';
};

// Get the API_URL using our dynamic function
const API_URL = getApiUrl();

console.log('Using API URL:', API_URL);

// Create an axios instance with defaults
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor för att hantera vanliga fel och token-förnyelse
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          console.error('Ingen refresh token tillgänglig. Användaren måste logga in igen.');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          
          window.dispatchEvent(new Event('auth:logout'));
          return Promise.reject(error);
        }
        
        console.log('Försöker förnya access token...');
        const response = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken,
        });
        
        const newAccessToken = response.data.access;
        
        localStorage.setItem('access_token', newAccessToken);
        console.log('Access token förnyad framgångsrikt');
        
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Förnyelse av token misslyckades:', refreshError);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(error);
      }
    }
    
    if (error.code === 'ECONNABORTED' || !error.response) {
      console.error('Nätverksfel: Anslutningen avbröts eller timeout', error);
      error.isNetworkError = true;
    }
    
    return Promise.reject(error);
  }
);

export default api;
