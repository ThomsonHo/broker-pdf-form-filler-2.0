'use client';

import React, { Suspense, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { TemplateManagement } from '@/components/admin/TemplateManagement';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

function TemplatesContent() {
  const { user, isAdmin, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      if (!isAdmin) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <Box sx={{ p: 3 }}>
      <TemplateManagement onRefresh={() => {}} />
    </Box>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense fallback={
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    }>
      <TemplatesContent />
    </Suspense>
  );
} 