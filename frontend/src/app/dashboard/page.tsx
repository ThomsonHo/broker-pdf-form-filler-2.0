'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    console.log('Dashboard page loaded, auth state:', { isAuthenticated, isLoading, user });
    
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');
    console.log('LocalStorage check:', { hasToken: !!token, hasUserData: !!userData });
    
    if (!isLoading) {
      setAuthChecked(true);
      if (!isAuthenticated && !token) {
        console.log('Not authenticated, redirecting to login');
        router.push('/login');
      }
    }
  }, [isLoading, isAuthenticated, router, user]);

  if (isLoading) {
    return <div>Loading authentication state...</div>;
  }

  const token = localStorage.getItem('access_token');
  const userData = localStorage.getItem('user');
  const isAuthenticatedFallback = !!token && !!userData;

  if (!isAuthenticated && !isAuthenticatedFallback) {
    if (authChecked) {
      return <div>Redirecting to login...</div>;
    }
    return <div>Checking authentication...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Dashboard />
    </div>
  );
} 