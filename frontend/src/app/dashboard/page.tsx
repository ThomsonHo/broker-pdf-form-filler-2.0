'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { Navbar } from '@/components/navigation/Navbar';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
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