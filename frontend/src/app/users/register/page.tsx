'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Link as MuiLink,
} from '@mui/material';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface RegisterFormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
  broker_company: string;
  tr_name: string;
  tr_license_number: string;
  tr_phone_number: string;
}

const registerSchema = yup.object<RegisterFormData>().shape({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  confirm_password: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  broker_company: yup.string().required('Broker company is required'),
  tr_name: yup.string().required('TR name is required'),
  tr_license_number: yup.string().required('TR license number is required'),
  tr_phone_number: yup.string().required('TR phone number is required'),
});

export default function RegisterPage() {
  const { register: authRegister } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
  });

  const handleFormSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await authRegister(data);
      router.push('/login?registered=true');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Paper
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 800,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Register
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }} align="center">
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            }}
          >
            <TextField
              fullWidth
              label="First Name"
              {...register('first_name')}
              error={!!errors.first_name}
              helperText={errors.first_name?.message}
            />
            <TextField
              fullWidth
              label="Last Name"
              {...register('last_name')}
              error={!!errors.last_name}
              helperText={errors.last_name?.message}
            />
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </Box>
            <TextField
              fullWidth
              label="Password"
              type="password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              {...register('confirm_password')}
              error={!!errors.confirm_password}
              helperText={errors.confirm_password?.message}
            />
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <TextField
                fullWidth
                label="Broker Company"
                {...register('broker_company')}
                error={!!errors.broker_company}
                helperText={errors.broker_company?.message}
              />
            </Box>
            <TextField
              fullWidth
              label="TR Name"
              {...register('tr_name')}
              error={!!errors.tr_name}
              helperText={errors.tr_name?.message}
            />
            <TextField
              fullWidth
              label="TR License Number"
              {...register('tr_license_number')}
              error={!!errors.tr_license_number}
              helperText={errors.tr_license_number?.message}
            />
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <TextField
                fullWidth
                label="TR Phone Number"
                {...register('tr_phone_number')}
                error={!!errors.tr_phone_number}
                helperText={errors.tr_phone_number?.message}
              />
            </Box>
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' }, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={isLoading}
                sx={{ minWidth: 200 }}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Register'}
              </Button>
              <Typography>
                Already have an account?{' '}
                <MuiLink component={Link} href="/login">
                  Login here
                </MuiLink>
              </Typography>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
} 