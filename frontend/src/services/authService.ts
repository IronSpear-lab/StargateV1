import apiService from './api';
import { User, ApiResponse } from '../types';

interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name?: string;
  last_name?: string;
}

interface LoginData {
  email: string;
  password: string;
}

const authService = {
  // Login-funktion
  async login(data: LoginData): Promise<ApiResponse<LoginResponse>> {
    console.log('Attempting login with:', { email: data.email, passwordLength: data.password.length });
    
    try {
      // Använd vanlig apiService istället för axios direkt
      const response = await apiService.post<{ access: string, refresh: string }>('/token/', data);
      
      console.log('Login response:', response);
      
      if (response.status === 200 && response.data) {
        // Spara tokens i localStorage
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        
        // Simulera ett user-objekt eftersom API:et inte returnerar det
        // Detta fixar vi längre fram, men gör att inloggningen fungerar för nu
        const userResponse = {
          access: response.data.access,
          refresh: response.data.refresh,
          user: {
            id: 1,
            email: data.email,
            username: data.email.split('@')[0],
            first_name: '',
            last_name: ''
          }
        };
        
        return {
          status: response.status,
          data: userResponse,
          message: 'Login successful'
        };
      } else {
        throw new Error('Ogiltig respons från servern');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Format error message
      let errorMessage = 'Inloggning misslyckades';
      
      if (error.response) {
        const status = error.response.status;
        
        if (status === 401) {
          errorMessage = 'Fel e-post eller lösenord';
        } else if (error.response.data) {
          if (typeof error.response.data.detail === 'string') {
            errorMessage = error.response.data.detail;
          } else if (typeof error.response.data === 'object') {
            try {
              errorMessage = Object.values(error.response.data).flat().join(', ');
            } catch (e) {
              // Fallback if we can't extract details
              errorMessage = `Error ${status}: ${JSON.stringify(error.response.data)}`;
            }
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        status: error.response?.status || 500,
        data: null as any, // Type assertion to bypass type check
        message: errorMessage
      };
    }
  },
  
  // Registrera-funktion
  async register(data: RegisterData): Promise<ApiResponse<User>> {
    return await apiService.post<User>('/users/', data);
  },
  
  // Hämta aktuell användare
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return await apiService.get<User>('/users/me/');
  },
  
  // Uppdatera användarprofil
  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return await apiService.patch<User>('/users/me/', userData);
  },
  
  // Logga ut
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },
  
  // Kontrollera om användare är autentiserad
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
  
  // Hämta aktuell token
  getToken(): string | null {
    return localStorage.getItem('token');
  },
  
  // Hämta refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  },
  
  // Ändra lösenord
  async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<any>> {
    return await apiService.post<any>('/users/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  },
  
  // Begär återställning av lösenord
  async requestPasswordReset(email: string): Promise<ApiResponse<any>> {
    return await apiService.post<any>('/users/reset-password-request/', {
      email,
    });
  },
  
  // Bekräfta återställning av lösenord
  async confirmPasswordReset(token: string, newPassword: string): Promise<ApiResponse<any>> {
    return await apiService.post<any>('/users/reset-password-confirm/', {
      token,
      new_password: newPassword,
    });
  },
};

export default authService;