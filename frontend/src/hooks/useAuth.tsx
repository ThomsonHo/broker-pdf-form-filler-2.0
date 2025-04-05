'use client';

// This file should be renamed to useAuth.tsx since it contains JSX
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { userService, User } from '@/services/userService';
import { api } from '@/services/api';

// Define RegisterData interface
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

// Extended User interface with is_superuser property
export interface AuthUser extends User {
  is_superuser: boolean;
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  broker_company: string;
  tr_name?: string;
  tr_license_number?: string;
  tr_phone_number?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  updateUser: (userData: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        const userData = localStorage.getItem('user');

        if (!accessToken || !refreshToken || !userData) {
          setLoading(false);
          return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser as AuthUser);
      } catch (error) {
        console.error('Error fetching user:', error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login/', { email, password });
      const { access, refresh, user: userData } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData as AuthUser);
    } catch (error) {
      setError(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      await userService.registerUser(data);
    } catch (error) {
      setError(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      setLoading(true);
      await userService.verifyEmail(token);
    } catch (error) {
      setError(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await userService.requestPasswordReset(email);
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      await userService.resetPassword(token, newPassword);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  const updateUser = async (userData: Partial<AuthUser>) => {
    try {
      const response = await api.patch('/users/me/', userData);
      const updatedUser = response.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading: loading,
    login,
    logout,
    register,
    forgotPassword,
    resetPassword,
    verifyEmail,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 