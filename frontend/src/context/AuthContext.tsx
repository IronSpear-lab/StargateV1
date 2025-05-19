import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import api from '../services/api';

// Define types locally instead of importing from types
interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  profile_pic?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Initial auth state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  error: null,
};

// Create context
interface AuthContextProps {
  authState: AuthState;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Set up axios interceptor for authentication headers and token refresh
const setupAxiosInterceptors = () => {
  // Add token to outgoing requests
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Handle token expiration and refresh
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // If error is unauthorized and we haven't tried to refresh yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (!refreshToken) {
            // No refresh token available, trigger logout
            window.dispatchEvent(new Event('auth:logout'));
            return Promise.reject(error);
          }
          
          // Try to get a new access token
          const response = await axios.post(`${api.defaults.baseURL}/token/refresh/`, {
            refresh: refreshToken
          });
          
          console.log('Token refresh successful');
          
          const { access } = response.data;
          
          // Update stored token
          localStorage.setItem('access_token', access);
          
          // Update header and retry original request
          originalRequest.headers['Authorization'] = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, trigger logout
          window.dispatchEvent(new Event('auth:logout'));
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );
};

// Setup interceptors right away
setupAxiosInterceptors();

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialState);

  // Listen for logout events (from token refresh failure)
  useEffect(() => {
    const handleLogout = () => {
      logout();
    };
    
    window.addEventListener('auth:logout', handleLogout);
    
    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  // Check if user is already logged in when component mounts
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          console.log('No token found, user not logged in');
          setAuthState({
            ...initialState,
            loading: false,
          });
          return;
        }

        console.log('Token found, verifying...');
        // Token exists, attempt to validate by getting user info
        const response = await api.get('/me/');
        
        console.log('User data received:', response.data);
        setAuthState({
          isAuthenticated: true,
          user: response.data as User,
          token,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Failed to load user:', error);
        // Token invalid or other error
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setAuthState({
          ...initialState,
          loading: false,
        });
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (username: string, password: string): Promise<void> => {
    try {
      setAuthState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      console.log('Attempting login with:', { username });
      
      // Get token - use the Django JWT endpoint
      // Note: Django uses email as the USERNAME_FIELD but the field name should still be 'username'
      const tokenResponse = await api.post('/token/', { username: username, password });
      console.log('Token response received:', tokenResponse.data);
      
      // Extract tokens
      const { access, refresh } = tokenResponse.data;
      
      console.log('Login successful, storing tokens');
      
      // Store tokens
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Now fetch user data with the token
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      const userResponse = await api.get('/me/');
      console.log('User data received:', userResponse.data);
      
      setAuthState({
        isAuthenticated: true,
        user: userResponse.data as User,
        token: access,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Ogiltiga inloggningsuppgifter eller serverfel.';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Fel användarnamn eller lösenord.';
        } else if (error.response.status === 429) {
          errorMessage = 'För många inloggningsförsök. Försök igen senare.';
        } else if (error.response.data?.detail) {
          errorMessage = error.response.data.detail;
        }
      } else if (error.code === 'ECONNABORTED' || !error.response) {
        errorMessage = 'Kunde inte ansluta till servern. Kontrollera din nätverksanslutning.';
      }
      
      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: errorMessage,
      }));
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      console.log('Logout initiated');
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        // Call backend logout endpoint to blacklist token
        await api.post('/logout/', { refresh: refreshToken });
        console.log('Token blacklisted successfully');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens and reset state regardless of API call success
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      console.log('Tokens cleared from storage');
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      });
    }
  };

  // Clear any error messages
  const clearError = (): void => {
    setAuthState((prev) => ({
      ...prev,
      error: null,
    }));
  };

  // Context provider
  return (
    <AuthContext.Provider value={{ authState, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
