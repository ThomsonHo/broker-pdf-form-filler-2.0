'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/services/userService';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

const passwordSchema = yup.object().shape({
  old_password: yup.string().required('Current password is required'),
  new_password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
    )
    .required('New password is required'),
  confirm_password: yup
    .string()
    .oneOf([yup.ref('new_password')], 'Passwords must match')
    .required('Please confirm your password'),
});

type PasswordFormData = yup.InferType<typeof passwordSchema>;

export default function ChangePasswordPage() {
  const { user: currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormData>({
    resolver: yupResolver(passwordSchema),
  });

  const handleFormSubmit = async (data: PasswordFormData) => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      await userService.changePassword(data.old_password, data.new_password);
      setSnackbar({
        open: true,
        message: 'Password changed successfully',
        severity: 'success',
      });
      reset();
    } catch (error) {
      console.error('Error changing password:', error);
      setSnackbar({
        open: true,
        message: 'Error changing password',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!currentUser) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Please log in to change your password.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Change Password
      </Typography>

      <Paper sx={{ p: 3, mt: 2, maxWidth: 600 }}>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              type="password"
              label="Current Password"
              {...register('old_password')}
              error={!!errors.old_password}
              helperText={errors.old_password?.message}
            />

            <TextField
              fullWidth
              type="password"
              label="New Password"
              {...register('new_password')}
              error={!!errors.new_password}
              helperText={errors.new_password?.message}
            />

            <TextField
              fullWidth
              type="password"
              label="Confirm New Password"
              {...register('confirm_password')}
              error={!!errors.confirm_password}
              helperText={errors.confirm_password?.message}
            />

            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={isLoading}
              sx={{ mt: 2 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Change Password'}
            </Button>
          </Box>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 