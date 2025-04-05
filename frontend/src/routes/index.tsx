import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// Layout components
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';

// Auth pages
import LoginPage from '@/app/users/login/page';
import RegisterPage from '@/app/users/register/page';
import ForgotPasswordPage from '@/app/users/forgot-password/page';
import ResetPasswordPage from '@/app/users/reset-password/page';
import VerifyEmailPage from '@/app/users/verify-email/page';

// User management pages
import UserProfilePage from '@/app/users/profile/page';
import ChangePasswordPage from '@/app/users/change-password/page';

// Admin pages
import AdminPanel from '@/app/admin/page';

// Other pages
import DashboardPage from '@/app/dashboard/page';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
      </Route>

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* User management routes */}
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
      </Route>

      {/* Admin routes */}
      <Route
        element={
          <ProtectedRoute requiredRole="admin">
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminPanel />} />
      </Route>

      {/* Fallback routes */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<div>Page not found</div>} />
    </Routes>
  );
};

export default AppRoutes; 