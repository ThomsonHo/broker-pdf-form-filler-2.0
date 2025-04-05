import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
} from '@mui/material';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { User } from '@/services/userService';

interface UserFormData {
  email: string;
  password?: string;
  password2?: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'standard';
  broker_company: string;
  tr_name?: string;
  tr_license_number?: string;
  tr_phone_number?: string;
}

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  user?: User;
  title: string;
}

const createSchema = (isEdit: boolean) => {
  return yup.object({
    email: yup.string().email('Invalid email').required('Email is required'),
    password: isEdit
      ? yup.string().optional()
      : yup.string()
          .required('Password is required')
          .min(10, 'Password must be at least 10 characters'),
    password2: isEdit
      ? yup.string().optional()
      : yup.string()
          .required('Please confirm your password')
          .oneOf([yup.ref('password')], 'Passwords must match'),
    first_name: yup.string().required('First name is required'),
    last_name: yup.string().required('Last name is required'),
    role: yup.string().oneOf(['admin', 'standard']).required('Role is required'),
    broker_company: yup.string().required('Broker company is required'),
    tr_name: yup.string().optional(),
    tr_license_number: yup.string().optional(),
    tr_phone_number: yup.string().optional(),
  });
};

export const UserForm: React.FC<UserFormProps> = ({
  open,
  onClose,
  onSubmit,
  user,
  title,
}) => {
  const isEdit = !!user;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UserFormData>({
    resolver: yupResolver<UserFormData>(createSchema(isEdit)),
    defaultValues: user
      ? {
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role as 'admin' | 'standard',
          broker_company: user.broker_company,
          tr_name: user.tr_name || '',
          tr_license_number: user.tr_license_number || '',
          tr_phone_number: user.tr_phone_number || '',
        }
      : {
          email: '',
          password: '',
          password2: '',
          first_name: '',
          last_name: '',
          role: 'standard',
          broker_company: '',
          tr_name: '',
          tr_license_number: '',
          tr_phone_number: '',
        },
  });

  const handleFormSubmit: SubmitHandler<UserFormData> = async (data) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="first_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="First Name"
                    fullWidth
                    error={!!errors.first_name}
                    helperText={errors.first_name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="last_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Last Name"
                    fullWidth
                    error={!!errors.last_name}
                    helperText={errors.last_name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    disabled={isEdit}
                  />
                )}
              />
            </Grid>
            {!isEdit && (
              <>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Password"
                        type="password"
                        fullWidth
                        error={!!errors.password}
                        helperText={errors.password?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="password2"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Confirm Password"
                        type="password"
                        fullWidth
                        error={!!errors.password2}
                        helperText={errors.password2?.message}
                      />
                    )}
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12} sm={6}>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.role}>
                    <InputLabel>Role</InputLabel>
                    <Select {...field} label="Role">
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="standard">Standard</MenuItem>
                    </Select>
                    {errors.role && (
                      <Typography variant="caption" color="error">
                        {errors.role.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="broker_company"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Broker Company"
                    fullWidth
                    error={!!errors.broker_company}
                    helperText={errors.broker_company?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                TR Information (Optional)
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="tr_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="TR Name"
                    fullWidth
                    error={!!errors.tr_name}
                    helperText={errors.tr_name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="tr_license_number"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="TR License Number"
                    fullWidth
                    error={!!errors.tr_license_number}
                    helperText={errors.tr_license_number?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="tr_phone_number"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="TR Phone Number"
                    fullWidth
                    error={!!errors.tr_phone_number}
                    helperText={errors.tr_phone_number?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 