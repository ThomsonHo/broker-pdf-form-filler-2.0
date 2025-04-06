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
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { userService, UserRegistrationData } from '@/services/userService';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '@/contexts/AuthContext';

interface RegistrationFormData {
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'standard';
  broker_company: string;
  tr_name?: string;
  tr_license_number?: string;
  tr_phone_number?: string;
}

const registrationSchema = yup.object().shape({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  password2: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  role: yup.string().oneOf(['admin', 'standard']).required('Role is required'),
  broker_company: yup.string().required('Company is required'),
  tr_name: yup.string(),
  tr_license_number: yup.string(),
  tr_phone_number: yup.string(),
});

function RegisterContent() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
  } = useForm<RegistrationFormData>({
    resolver: yupResolver(registrationSchema),
    defaultValues: {
      role: 'standard',
    },
  });

  const handleFormSubmit = async (data: RegistrationFormData) => {
    setLoading(true);
    try {
      await registerUser(data);
      setSnackbar({
        open: true,
        message: 'Registration successful! Please check your email to verify your account.',
        severity: 'success',
      });
      setTimeout(() => {
        router.push('/users/login');
      }, 3000);
    } catch (error) {
      console.error('Registration error:', error);
      setSnackbar({
        open: true,
        message: 'Error during registration. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Register
          </Typography>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  {...register('first_name')}
                  error={!!errors.first_name}
                  helperText={errors.first_name?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  {...register('last_name')}
                  error={!!errors.last_name}
                  helperText={errors.last_name?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  {...register('email')}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  {...register('password')}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  {...register('password2')}
                  error={!!errors.password2}
                  helperText={errors.password2?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.role}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    label="Role"
                    {...register('role')}
                    defaultValue="standard"
                  >
                    <MenuItem value="standard">Standard</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                  {errors.role && (
                    <Typography color="error" variant="caption">
                      {errors.role.message}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company"
                  {...register('broker_company')}
                  error={!!errors.broker_company}
                  helperText={errors.broker_company?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="TR Name"
                  {...register('tr_name')}
                  error={!!errors.tr_name}
                  helperText={errors.tr_name?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="TR License Number"
                  {...register('tr_license_number')}
                  error={!!errors.tr_license_number}
                  helperText={errors.tr_license_number?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="TR Phone Number"
                  {...register('tr_phone_number')}
                  error={!!errors.tr_phone_number}
                  helperText={errors.tr_phone_number?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Register'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>

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
    </Container>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    }>
      <RegisterContent />
    </Suspense>
  );
} 