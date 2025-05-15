import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@services/api';
import { User, AuthState } from '@types/index';

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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialState);

  // Check if user is already logged in when component mounts
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setAuthState({
            ...initialState,
            loading: false,
          });
          return;
        }

        // Token exists, attempt to validate by getting user info
        const response = await api.get('/users/me/');
        
        setAuthState({
          isAuthenticated: true,
          user: response.data as User,
          token,
          loading: false,
          error: null,
        });
      } catch (error) {
        // Token invalid or other error
        localStorage.removeItem('token');
        setAuthState({
          ...initialState,
          loading: false,
        });
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setAuthState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      // Get token
      const tokenResponse = await api.post('/token/', { email, password });
      const { access, refresh } = tokenResponse.data;
      
      // Store tokens
      localStorage.setItem('token', access);
      localStorage.setItem('refreshToken', refresh);
      
      // Get user info
      const userResponse = await api.get('/users/me/');
      
      setAuthState({
        isAuthenticated: true,
        user: userResponse.data as User,
        token: access,
        loading: false,
        error: null,
      });
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: 'Invalid credentials or server error',
      }));
    }
  };

  // Logout function
  const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      error: null,
    });
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
