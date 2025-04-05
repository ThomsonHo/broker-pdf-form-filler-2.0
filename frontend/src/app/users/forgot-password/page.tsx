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
  Link,
} from '@mui/material';
import NextLink from 'next/link';
import { userService } from '@/services/userService';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

const forgotPasswordSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
});

type ForgotPasswordFormData = yup.InferType<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
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
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema),
  });

  const handleFormSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await userService.requestPasswordReset(data.email);
      setSnackbar({
        open: true,
        message:
          'If an account exists with this email, you will receive password reset instructions.',
        severity: 'success',
      });
      reset();
    } catch (error) {
      console.error('Error requesting password reset:', error);
      setSnackbar({
        open: true,
        message: 'Error requesting password reset',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Forgot Password
      </Typography>

      <Paper sx={{ p: 3, mt: 2, maxWidth: 600 }}>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Enter your email address and we'll send you instructions to reset your
          password.
        </Typography>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
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