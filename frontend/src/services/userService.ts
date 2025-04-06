import { api } from './api';

// Define API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  broker_company: string;
  tr_name?: string;
  tr_license_number?: string;
  tr_phone_number?: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  broker_company: string;
  tr_name?: string;
  tr_license_number?: string;
  tr_phone_number?: string;
  password?: string;
  password2?: string;
}

export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
  broker_company?: string;
  tr_name?: string;
  tr_license_number?: string;
  tr_phone_number?: string;
  is_active?: boolean;
}

export interface UserRegistrationData {
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

export interface QuotaUsage {
  daily_usage: number;
  daily_quota: number;
  has_daily_quota: boolean;
  monthly_usage: number;
  monthly_quota: number;
  has_monthly_quota: boolean;
}

export interface UserActivity {
  id: string;
  type: 'login' | 'logout' | 'update' | 'delete' | 'create' | 'email_verification' | 'password_change';
  description: string;
  timestamp: string;
}

export interface BrokerCompany {
  id: string;
  name: string;
  ia_reg_code: string;
  mpfa_reg_code: string;
  phone_number: string;
  address: string;
  responsible_officer_email: string;
  contact_email: string;
  created_at: string;
  updated_at: string;
  user_count: number;
}

class UserService {
  private baseUrl = `${API_BASE_URL}/users`;

  async getUsers(): Promise<User[]> {
    const response = await api.get('/users/');
    return response.data;
  }

  async getUser(id: string): Promise<User> {
    const response = await api.get(`/users/${id}/`);
    return response.data;
  }

  async createUser(data: CreateUserData & { password?: string; password2?: string }): Promise<User> {
    // If password is provided, use the registration endpoint
    if (data.password && data.password2) {
      try {
        const registrationData: UserRegistrationData = {
          email: data.email,
          password: data.password,
          password2: data.password2,
          first_name: data.first_name,
          last_name: data.last_name,
          role: data.role as 'admin' | 'standard',
          broker_company: data.broker_company,
          tr_name: data.tr_name || undefined,
          tr_license_number: data.tr_license_number || undefined,
          tr_phone_number: data.tr_phone_number || undefined,
        };
        
        console.log('Registration data:', registrationData);
        console.log('Broker company type:', typeof data.broker_company);
        console.log('Broker company value:', data.broker_company);
        
        const response = await api.post('/users/register/', registrationData);
        return response.data;
      } catch (error: any) {
        console.error('Registration error:', error.response?.data || error.message);
        console.error('Full error object:', error);
        throw error;
      }
    }
    
    // Otherwise use the regular create endpoint (should not happen with our current UI)
    const response = await api.post('/users/', data);
    return response.data;
  }

  async getBrokerCompanyByCode(code: string): Promise<BrokerCompany> {
    const companies = await this.getBrokerCompanies();
    const company = companies.find(c => c.ia_reg_code === code);
    if (!company) {
      throw new Error(`Broker company with code ${code} not found`);
    }
    return company;
  }

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    const response = await api.patch(`/users/${id}/`, data);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}/`);
  }

  async updateProfile(data: UpdateUserData): Promise<User> {
    const response = await api.patch('/users/profile/', data);
    return response.data;
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await api.post('/users/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  }

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/users/me/');
    return response.data;
  }

  async registerUser(data: UserRegistrationData): Promise<User> {
    const response = await api.post('/users/register/', data);
    return response.data;
  }

  async verifyEmail(token: string): Promise<User> {
    const response = await api.post('/users/verify-email/', { token });
    return response.data;
  }

  async requestPasswordReset(email: string): Promise<void> {
    await api.post('/users/reset-password-request/', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/users/reset-password-confirm/', {
      token,
      new_password: newPassword,
      new_password2: newPassword,
    });
  }

  async getQuotaUsage(): Promise<QuotaUsage> {
    const response = await api.get('/users/quota-usage/');
    return response.data;
  }

  async getUserActivity(userId?: string, limit: number = 10): Promise<UserActivity[]> {
    const params = new URLSearchParams();
    if (userId) {
      params.append('userId', userId);
    }
    params.append('limit', limit.toString());
    
    const response = await api.get('/users/activity/', { params });
    return response.data;
  }

  async listUsers(params?: {
    search?: string;
    role?: string;
    page?: number;
    page_size?: number;
  }): Promise<{ results: User[]; count: number }> {
    const response = await api.get('/users/', { params });
    return response.data;
  }

  async getBrokerCompanies(): Promise<BrokerCompany[]> {
    const response = await api.get('/users/broker-companies/');
    return response.data.results || [];
  }

  async createBrokerCompany(data: Omit<BrokerCompany, 'created_at' | 'updated_at' | 'user_count'>): Promise<BrokerCompany> {
    const response = await api.post('/users/broker-companies/', data);
    return response.data;
  }

  async updateBrokerCompany(iaRegCode: string, data: Partial<BrokerCompany>): Promise<BrokerCompany> {
    const response = await api.patch(`/users/broker-companies/${iaRegCode}/`, data);
    return response.data;
  }

  async deleteBrokerCompany(iaRegCode: string): Promise<void> {
    await api.delete(`/users/broker-companies/${iaRegCode}/`);
  }
}

export const userService = new UserService();   