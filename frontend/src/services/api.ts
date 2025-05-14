import axios from 'axios';
import { ApiResponse, PaginatedResponse } from '../types';

// API-basurl - använd relativ URL för att använda Vite-proxyn i Replit-miljön
const API_URL = '/api';

// Skapa en Axios-instans med basinställningar
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Viktigt för CORS med autentiseringssupport
  timeout: 10000, // Timeout på 10 sekunder
});

// Interceptor för att hantera autentiseringstoken
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor för att hantera token-förnyelse
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Om 401 (Unauthorized) och inte redan försökt förnya token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        // Begär ny token med refresh-token
        const response = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken,
        });
        
        // Spara nya tokens
        const { access } = response.data;
        localStorage.setItem('token', access);
        
        // Uppdatera header och försök igen
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Vid fel med token-förnyelse loggas användaren ut
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Generic API functions
const apiService = {
  baseURL: API_URL,
  // GET request
  async get<T>(endpoint: string, params?: any): Promise<ApiResponse<T>> {
    try {
      const response = await api.get<T>(endpoint, { params });
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error: any) {
      return this.handleError<T>(error);
    }
  },
  
  // GET paginated request
  async getPaginated<T>(endpoint: string, params?: any): Promise<PaginatedResponse<T>> {
    try {
      const response = await api.get<PaginatedResponse<T>>(endpoint, { params });
      return response.data;
    } catch (error: any) {
      throw this.formatError(error);
    }
  },
  
  // POST request
  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await api.post<T>(endpoint, data);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error: any) {
      return this.handleError<T>(error);
    }
  },
  
  // PUT request
  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await api.put<T>(endpoint, data);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error: any) {
      return this.handleError<T>(error);
    }
  },
  
  // PATCH request
  async patch<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await api.patch<T>(endpoint, data);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error: any) {
      return this.handleError<T>(error);
    }
  },
  
  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await api.delete<T>(endpoint);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error: any) {
      return this.handleError<T>(error);
    }
  },
  
  // Upload file
  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }
      
      const response = await api.post<T>(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error: any) {
      return this.handleError<T>(error);
    }
  },
  
  // Error handling
  handleError<T>(error: any): ApiResponse<T> {
    const errorMsg = this.formatError(error);
    return {
      data: {} as T,
      status: error.response?.status || 500,
      message: errorMsg,
    };
  },
  
  formatError(error: any): string {
    if (error.response) {
      // Server error response
      const data = error.response.data;
      
      if (typeof data === 'string') {
        return data;
      }
      
      if (data.detail) {
        return data.detail;
      }
      
      if (typeof data === 'object') {
        return Object.values(data).flat().join(', ');
      }
      
      return `Server error: ${error.response.status}`;
    }
    
    if (error.request) {
      // Request made but no response
      return 'No response from server. Please check your internet connection.';
    }
    
    // Request setup error
    return error.message || 'An unknown error occurred';
  },
  
  // Health check
  async checkHealth(): Promise<boolean> {
    try {
      const response = await api.get('/status/');
      return response.data.status === 'ok';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  },
};

export default apiService;