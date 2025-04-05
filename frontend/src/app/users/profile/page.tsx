'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  Avatar,
  IconButton,
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/services/userService';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

const profileSchema = yup.object().shape({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  tr_name: yup.string(),
  tr_license_number: yup.string(),
  tr_phone_number: yup.string(),
  broker_company: yup.string().required('Company is required'),
});

type ProfileFormData = yup.InferType<typeof profileSchema>;

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
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
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      tr_name: user?.tr_name || '',
      tr_license_number: user?.tr_license_number || '',
      tr_phone_number: user?.tr_phone_number || '',
      broker_company: user?.broker_company || '',
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset();
  };

  const handleFormSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const updatedUser = await userService.updateProfile(data);
      await updateUser(updatedUser);
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success',
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: 'Error updating profile',
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
      <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Profile
          </Typography>
          {!isEditing ? (
            <Button
              startIcon={<EditIcon />}
              variant="outlined"
              onClick={handleEdit}
            >
              Edit Profile
            </Button>
          ) : (
            <Box>
              <Button
                startIcon={<CancelIcon />}
                variant="outlined"
                onClick={handleCancel}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button
                startIcon={<SaveIcon />}
                variant="contained"
                onClick={handleSubmit(handleFormSubmit)}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Save Changes'}
              </Button>
            </Box>
          )}
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} display="flex" justifyContent="center">
            <Avatar
              sx={{ width: 100, height: 100, mb: 2 }}
              src={user?.avatar_url}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              {...register('first_name')}
              error={!!errors.first_name}
              helperText={errors.first_name?.message}
              disabled={!isEditing}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              {...register('last_name')}
              error={!!errors.last_name}
              helperText={errors.last_name?.message}
              disabled={!isEditing}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={!isEditing}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Company"
              {...register('broker_company')}
              error={!!errors.broker_company}
              helperText={errors.broker_company?.message}
              disabled={!isEditing}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="TR Name"
              {...register('tr_name')}
              error={!!errors.tr_name}
              helperText={errors.tr_name?.message}
              disabled={!isEditing}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="TR License Number"
              {...register('tr_license_number')}
              error={!!errors.tr_license_number}
              helperText={errors.tr_license_number?.message}
              disabled={!isEditing}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="TR Phone Number"
              {...register('tr_phone_number')}
              error={!!errors.tr_phone_number}
              helperText={errors.tr_phone_number?.message}
              disabled={!isEditing}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" color="textSecondary">
              Role: {user?.role}
            </Typography>
          </Grid>
        </Grid>
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