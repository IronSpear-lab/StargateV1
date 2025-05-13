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
    const response = await apiService.post<LoginResponse>('/token/', data);
    
    if (response.status === 200 && response.data) {
      // Spara tokens i localStorage
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
    }
    
    return response;
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