'use client';

import React, { Suspense, useEffect } from 'react';
import { Box, Typography, Paper, Button, CircularProgress } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

function AdminContent() {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!isAdmin) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isAdmin, router]);

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Welcome, {user?.email}
      </Typography>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, 
        gap: 3, 
        mt: 2 
      }}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            User Management
          </Typography>
          <Typography variant="body1" paragraph>
            Manage user accounts, roles, and permissions.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => router.push('/users')}
          >
            Manage Users
          </Button>
        </Paper>
        
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Broker Company Management
          </Typography>
          <Typography variant="body1" paragraph>
            Manage broker companies and their settings.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => router.push('/admin/broker-companies')}
          >
            Manage Companies
          </Button>
        </Paper>

        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            PDF Template Management
          </Typography>
          <Typography variant="body1" paragraph>
            Manage PDF form templates and field mappings.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => router.push('/templates')}
          >
            Manage Templates
          </Button>
        </Paper>

        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Form Set Management
          </Typography>
          <Typography variant="body1" paragraph>
            Organize and manage form sets and their templates.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => router.push('/admin/form-sets')}
          >
            Manage Form Sets
          </Button>
        </Paper>

        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Standardized Fields
          </Typography>
          <Typography variant="body1" paragraph>
            Manage standardized fields and their definitions.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => router.push('/admin/standardized-fields')}
          >
            Manage Fields
          </Button>
        </Paper>

        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Field Mapping
          </Typography>
          <Typography variant="body1" paragraph>
            Map PDF form fields to standardized fields.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => router.push('/admin/field-mapping')}
          >
            Manage Mappings
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}

export default function AdminPanel() {
  return (
    <Suspense fallback={
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    }>
      <AdminContent />
    </Suspense>
  );
} 