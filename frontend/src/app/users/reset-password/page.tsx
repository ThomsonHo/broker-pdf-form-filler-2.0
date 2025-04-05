'use client';

import React, { useState, Suspense } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import NextLink from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { userService } from '@/services/userService';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

const resetPasswordSchema = yup.object().shape({
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

type ResetPasswordFormData = yup.InferType<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  const router = useRouter();
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
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema),
  });

  const handleFormSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;

    setIsLoading(true);
    try {
      await userService.resetPassword(token, data.new_password);
      setSnackbar({
        open: true,
        message: 'Password reset successful. You can now login with your new password.',
        severity: 'success',
      });
      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push('/users/login');
      }, 3000);
    } catch (error) {
      console.error('Error resetting password:', error);
      setSnackbar({
        open: true,
        message: 'Error resetting password. The link may have expired.',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!token) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Invalid password reset link.</Typography>
        <Box sx={{ mt: 2 }}>
          <Link component={NextLink} href="/users/forgot-password">
            Request a new password reset link
          </Link>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Reset Password
      </Typography>

      <Paper sx={{ p: 3, mt: 2, maxWidth: 600 }}>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Please enter your new password.
        </Typography>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
              {isLoading ? <CircularProgress size={24} /> : 'Reset Password'}
            </Button>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link component={NextLink} href="/users/login">
                Back to Login
              </Link>
            </Box>
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<CircularProgress />}>
      <ResetPasswordContent />
    </Suspense>
  );
} 