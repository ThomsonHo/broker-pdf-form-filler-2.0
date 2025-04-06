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
  FormHelperText,
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
  brokerCompanies: { id: number; ia_reg_code: string; name: string }[];
}

const createSchema = (isEdit: boolean) => {
  return yup.object({
    email: yup.string().email('Invalid email').required('Email is required'),
    password: isEdit
      ? yup.string().optional()
      : yup.string()
          .required('Password is required')
          .min(10, 'Password must be at least 10 characters')
          .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/,
            'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
          ),
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
  brokerCompanies,
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
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
            <Box>
              <Controller
                name="first_name"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="First Name"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Box>

            <Box>
              <Controller
                name="last_name"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Last Name"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Box>

            <Box sx={{ gridColumn: { xs: '1', sm: 'span 2' } }}>
              <Controller
                name="email"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Email"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                    disabled={isEdit}
                  />
                )}
              />
            </Box>

            <Box sx={{ gridColumn: { xs: '1', sm: 'span 2' } }}>
              <Controller
                name="role"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <InputLabel>Role</InputLabel>
                    <Select {...field} label="Role">
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="standard">Standard</MenuItem>
                    </Select>
                    {error && (
                      <FormHelperText>{error.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Box>

            {!isEdit && (
              <>
                <Box>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        type="password"
                        label="Password"
                        fullWidth
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                </Box>

                <Box>
                  <Controller
                    name="password2"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        type="password"
                        label="Confirm Password"
                        fullWidth
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                </Box>
              </>
            )}

            <Box sx={{ gridColumn: { xs: '1', sm: 'span 2' } }}>
              <Controller
                name="broker_company"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <InputLabel>Broker Company</InputLabel>
                    <Select {...field} label="Broker Company">
                      {brokerCompanies.map((company) => (
                        <MenuItem key={company.id} value={company.ia_reg_code}>
                          {company.name} ({company.ia_reg_code})
                        </MenuItem>
                      ))}
                    </Select>
                    {error && (
                      <FormHelperText>{error.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Box>

            <Box sx={{ gridColumn: { xs: '1', sm: 'span 2' } }}>
              <Typography variant="subtitle1" gutterBottom>
                TR Information (Optional)
              </Typography>
            </Box>

            <Box>
              <Controller
                name="tr_name"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="TR Name"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Box>

            <Box>
              <Controller
                name="tr_license_number"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="TR License Number"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Box>

            <Box>
              <Controller
                name="tr_phone_number"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="TR Phone Number"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Box>
          </Box>
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