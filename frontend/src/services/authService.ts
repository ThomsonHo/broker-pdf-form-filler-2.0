import axios from 'axios';
import { User } from './userService';

// Define API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Extended User interface with is_superuser property
export interface AuthUser extends User {
  is_superuser: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'standard';
  broker_company: string;
  tr_name?: string;
  tr_license_number?: string;
  tr_phone_number?: string;
}

class AuthService {
  private baseUrl = `${API_BASE_URL}/auth`;

  async login(credentials: LoginCredentials): Promise<{ user: AuthUser; token: string }> {
    const response = await axios.post(`${this.baseUrl}/login/`, credentials);
    return response.data;
  }

  async logout(): Promise<void> {
    await axios.post(`${this.baseUrl}/logout/`);
  }

  async register(data: RegisterData): Promise<AuthUser> {
    const response = await axios.post(`${this.baseUrl}/register/`, data);
    return response.data;
  }

  async verifyEmail(token: string): Promise<void> {
    await axios.post(`${this.baseUrl}/verify-email/`, { token });
  }

  async requestPasswordReset(email: string): Promise<void> {
    await axios.post(`${this.baseUrl}/reset-password-request/`, { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await axios.post(`${this.baseUrl}/reset-password-confirm/`, {
      token,
      new_password: newPassword,
      new_password2: newPassword,
    });
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await axios.post(`${this.baseUrl}/change-password/`, {
      old_password: oldPassword,
      new_password: newPassword,
      new_password2: newPassword,
    });
  }

  async getCurrentUser(): Promise<AuthUser> {
    const response = await axios.get(`${this.baseUrl}/me/`);
    return response.data;
  }
}

export const authService = new AuthService(); 