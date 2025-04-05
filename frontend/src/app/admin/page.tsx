'use client';

import React from 'react';
import { Box, Typography, Paper, Grid, Button } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function AdminPanel() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Welcome, {user?.first_name} {user?.last_name}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You are logged in as an administrator.
        </Typography>
      </Paper>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              User Management
            </Typography>
            <Typography variant="body1" paragraph>
              Manage user accounts, roles, and permissions.
            </Typography>
            <Button variant="contained" color="primary">
              Manage Users
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              System Settings
            </Typography>
            <Typography variant="body1" paragraph>
              Configure system-wide settings and preferences.
            </Typography>
            <Button variant="contained" color="primary">
              Settings
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 