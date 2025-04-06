'use client';

import React, { Suspense, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { UserManagement } from '@/components/admin/UserManagement';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

function UsersContent() {
  const { user, isAdmin, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Log initial render
  console.log('UsersContent rendered');
  console.log('User object:', user);
  console.log('isAuthenticated:', isAuthenticated);
  console.log('isAdmin:', isAdmin);
  console.log('isLoading:', isLoading);
  console.log('User role:', user?.role);
  console.log('User is_superuser:', user?.is_superuser);

  useEffect(() => {
    console.log('UsersContent useEffect triggered');
    console.log('isAuthenticated in useEffect:', isAuthenticated);
    console.log('isAdmin in useEffect:', isAdmin);
    console.log('isLoading in useEffect:', isLoading);
    console.log('User in useEffect:', user);

    // Only redirect if we're not loading and the user is not authenticated or not an admin
    if (!isLoading) {
      if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to login...');
        router.push('/login');
        return;
      }
      if (!isAdmin) {
        console.log('Not admin, redirecting to dashboard...');
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isAdmin, router, user, isLoading]);

  // Show loading spinner while authentication is being checked
  if (isLoading) {
    console.log('Still loading auth state, showing spinner');
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    console.log('Guard clause triggered - returning null');
    console.log('isAuthenticated in guard:', isAuthenticated);
    console.log('isAdmin in guard:', isAdmin);
    return null;
  }

  console.log('Rendering UserManagement component');
  return (
    <Box sx={{ p: 3 }}>
      <UserManagement onRefresh={() => {}} />
    </Box>
  );
}

export default function UsersPage() {
  console.log('UsersPage rendered');
  return (
    <Suspense fallback={
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    }>
      <UsersContent />
    </Suspense>
  );
} 