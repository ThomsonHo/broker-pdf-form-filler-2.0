'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { Navbar } from '@/components/navigation/Navbar';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const user = localStorage.getItem('user');

    if (!accessToken || !refreshToken || !user) {
      console.log('Missing authentication data:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        hasUser: !!user
      });
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Dashboard />
    </div>
  );
} 