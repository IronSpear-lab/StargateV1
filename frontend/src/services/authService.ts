import axios from 'axios';
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
      // Använd vår apiService för att göra anropet, vilket går via Vite-proxyn
      const response = await axios.post('/api/token/', data, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true
      });
      
      console.log('Login successful, response:', response.status);
      
      // Extrahera data
      const responseData = response.data;
      
      // Spara tokens i localStorage
      localStorage.setItem('token', responseData.access);
      localStorage.setItem('refreshToken', responseData.refresh);
      
      // Simulera ett user-objekt eftersom API:et inte returnerar det
      // Detta fixar vi längre fram, men gör att inloggningen fungerar för nu
      const userResponse = {
        access: responseData.access,
        refresh: responseData.refresh,
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
    } catch (error: any) {
      console.error('Login error:', error.response || error);
      
      // Format error message
      let errorMessage = 'Inloggning misslyckades';
      
      if (error.response) {
        // Handle API error responses
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 401) {
          errorMessage = 'Fel e-post eller lösenord';
        } else if (data && data.detail) {
          errorMessage = data.detail;
        } else if (typeof data === 'object') {
          errorMessage = Object.values(data).flat().join(', ');
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'Ingen respons från servern';
      } else {
        // Something happened in setting up the request
        errorMessage = error.message || 'Ett oväntat fel inträffade';
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