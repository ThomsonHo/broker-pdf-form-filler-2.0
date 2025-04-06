'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_superuser: boolean;
  created_at: string;
  tr_name?: string;
  tr_license_number?: string;
  tr_phone_number?: string;
  broker_company?: string;
  company_name?: string;
  phone_number?: string;
}

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('Initializing authentication state');
        const token = localStorage.getItem('access_token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
          console.log('Found token and user data in localStorage');
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } else {
          console.log('No token or user data found in localStorage');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login with:', email);
      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Login failed with status:', response.status);
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      console.log('Login successful, received data:', data);
      
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setUser(data.user);
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await fetch('http://localhost:8000/api/auth/change-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
      });

      if (!response.ok) {
        throw new Error('Failed to change password');
      }
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/request-password-reset/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to request password reset');
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token || !user) {
        throw new Error('No access token or user found');
      }

      const response = await fetch(`http://localhost:8000/api/users/${user.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to register');
      }

      const result = await response.json();
      localStorage.setItem('access_token', result.access);
      localStorage.setItem('refresh_token', result.refresh);
      localStorage.setItem('user', JSON.stringify(result.user));
      setUser(result.user);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isLoading,
    login,
    logout,
    changePassword,
    requestPasswordReset,
    updateUser,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}    