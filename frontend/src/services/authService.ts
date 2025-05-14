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
      // Använd URL baserad på fönstrets lokation för att hantera olika miljöer
      // I Replit behöver vi inte ange porten eftersom API:et körs på samma host
      const backendHost = window.location.hostname === 'localhost' 
        ? 'http://localhost:8001/api' 
        : '/api';  // Relativ väg fungerar bättre i Replit-miljön
      const url = `${backendHost}/token/`;
      console.log('Login URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        mode: 'cors',
        credentials: 'include',
      });
      
      console.log('Login response status:', response.status);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('Login successful, received tokens');
        
        // Spara tokens i localStorage
        localStorage.setItem('token', responseData.access);
        localStorage.setItem('refreshToken', responseData.refresh);
        
        return {
          status: response.status,
          data: responseData,
          message: 'Login successful'
        };
      } else {
        const errorText = await response.text();
        console.error('Login failed:', response.status, errorText);
        
        return {
          status: response.status,
          data: null,
          message: `Login failed: ${errorText}`
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        status: 500,
        data: null,
        message: error instanceof Error ? error.message : 'Unknown error during login'
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