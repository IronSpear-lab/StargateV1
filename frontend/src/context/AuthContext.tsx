import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import authService from '../services/authService';

// Standardvärden för auth state
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Skapa context för autentisering
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Context provider-komponent
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);

  // Ladda användar-/token-data vid uppstart
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (token) {
        setState(prev => ({
          ...prev,
          token,
          refreshToken,
          isAuthenticated: true,
        }));
        
        try {
          const response = await authService.getCurrentUser();
          if (response.status === 200) {
            setState(prev => ({
              ...prev,
              user: response.data,
              isLoading: false,
            }));
          } else {
            throw new Error(response.message || 'Failed to get user data');
          }
        } catch (error) {
          console.error('Failed to get user:', error);
          setState(prev => ({
            ...prev,
            isAuthenticated: false,
            isLoading: false,
            error: 'Session expired. Please login again.',
          }));
          // Rensa tokens om de är ogiltiga
          authService.logout();
        }
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
        }));
      }
    };
    
    initAuth();
  }, []);

  // Login-funktion
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await authService.login({ email, password });
      
      if (response.status === 200 && response.data) {
        setState({
          user: response.data.user,
          token: response.data.access,
          refreshToken: response.data.refresh,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Login failed',
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
      return false;
    }
  };

  // Registrerings-funktion
  const register = async (data: any): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await authService.register(data);
      
      if (response.status === 201) {
        // Automatisk inloggning efter registrering
        return await login(data.email, data.password);
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Registration failed',
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      }));
      return false;
    }
  };

  // Logout-funktion
  const logout = () => {
    authService.logout();
    setState({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  // Uppdatera användarprofil
  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await authService.updateProfile(userData);
      
      if (response.status === 200) {
        setState(prev => ({
          ...prev,
          user: response.data,
          isLoading: false,
        }));
        return true;
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Failed to update profile',
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update profile',
      }));
      return false;
    }
  };

  // Provider-värden
  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook för att använda auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;