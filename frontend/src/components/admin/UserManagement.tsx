'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import { userService, User, BrokerCompany } from '@/services/userService';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

const userSchema = yup.object().shape({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  role: yup.string().oneOf(['admin', 'standard'], 'Invalid role').required('Role is required'),
  broker_company: yup.string().required('Company is required'),
  password: yup.string().when('$isEditing', {
    is: false,
    then: (schema) => schema.required('Password is required'),
    otherwise: (schema) => schema.optional(),
  }),
  password2: yup.string().when('$isEditing', {
    is: false,
    then: (schema) => schema
      .required('Password confirmation is required')
      .oneOf([yup.ref('password')], 'Passwords must match'),
    otherwise: (schema) => schema.optional(),
  }),
  tr_name: yup.string().nullable(),
  tr_license_number: yup.string().nullable(),
  tr_phone_number: yup.string().nullable(),
  is_active: yup.boolean().default(true),
});

type UserFormData = yup.InferType<typeof userSchema>;

interface UserManagementProps {
  onRefresh?: () => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ onRefresh }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [brokerCompanies, setBrokerCompanies] = useState<BrokerCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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
    setValue,
    watch,
  } = useForm<UserFormData>({
    resolver: yupResolver(userSchema),
    context: { isEditing: !!selectedUser },
    defaultValues: {
      role: 'standard',
      broker_company: '',
      is_active: true,
    }
  });

  const fetchUsers = async () => {
    try {
      const response = await userService.listUsers({
        page: page + 1,
        page_size: rowsPerPage
      });
      setUsers(response.results || []);
      setTotalCount(response.count || 0);
    } catch (error) {
      console.error('Error fetching users:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching users',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBrokerCompanies = async () => {
    try {
      const companies = await userService.getBrokerCompanies();
      setBrokerCompanies(companies);
    } catch (error) {
      console.error('Error fetching broker companies:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching broker companies',
        severity: 'error',
      });
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchBrokerCompanies();
  }, [page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      const brokerCompany = brokerCompanies.find(c => c.ia_reg_code === user.broker_company);
      reset({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role as 'admin' | 'standard',
        broker_company: brokerCompany?.ia_reg_code || '',
        tr_name: user.tr_name || null,
        tr_license_number: user.tr_license_number || null,
        tr_phone_number: user.tr_phone_number || null,
        is_active: user.is_active,
      });
    } else {
      setSelectedUser(null);
      reset({
        role: 'standard',
        broker_company: '',
        is_active: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    reset({});
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      const formData = {
        ...data,
        tr_name: data.tr_name || undefined,
        tr_license_number: data.tr_license_number || undefined,
        tr_phone_number: data.tr_phone_number || undefined,
      };

      if (selectedUser) {
        await userService.updateUser(selectedUser.id, formData);
        setSnackbar({
          open: true,
          message: 'User updated successfully',
          severity: 'success',
        });
      } else {
        await userService.createUser({
          ...formData,
          password: data.password,
          password2: data.password2,
        });
        setSnackbar({
          open: true,
          message: 'User created successfully',
          severity: 'success',
        });
      }
      handleCloseDialog();
      fetchUsers();
      if (onRefresh) onRefresh();
    } catch (error: any) {
      console.error('Error saving user:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error saving user',
        severity: 'error',
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(userId);
        setSnackbar({
          open: true,
          message: 'User deleted successfully',
          severity: 'success',
        });
        fetchUsers();
        if (onRefresh) onRefresh();
      } catch (error) {
        console.error('Error deleting user:', error);
        setSnackbar({
          open: true,
          message: 'Error deleting user',
          severity: 'error',
        });
      }
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      await userService.updateUser(userId, { is_active: !currentStatus });
      setSnackbar({
        open: true,
        message: `User ${currentStatus ? 'deactivated' : 'activated'} successfully`,
        severity: 'success',
      });
      fetchUsers();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error updating user status:', error);
      setSnackbar({
        open: true,
        message: 'Error updating user status',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">User Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add User
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(users || []).map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  {user.first_name} {user.last_name}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.broker_company}</TableCell>
                <TableCell>
                  {user.is_active ? 'Active' : 'Inactive'}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpenDialog(user)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleToggleActive(user.id, user.is_active)}
                    size="small"
                  >
                    <BlockIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteUser(user.id)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedUser ? 'Edit User' : 'Add User'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Box display="grid" gap={2}>
              <TextField
                label="First Name"
                {...register('first_name')}
                error={!!errors.first_name}
                helperText={errors.first_name?.message}
                fullWidth
              />
              <TextField
                label="Last Name"
                {...register('last_name')}
                error={!!errors.last_name}
                helperText={errors.last_name?.message}
                fullWidth
              />
              <TextField
                label="Email"
                type="email"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                fullWidth
              />
              {!selectedUser && (
                <>
                  <TextField
                    label="Password"
                    type="password"
                    {...register('password')}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    fullWidth
                  />
                  <TextField
                    label="Confirm Password"
                    type="password"
                    {...register('password2')}
                    error={!!errors.password2}
                    helperText={errors.password2?.message}
                    fullWidth
                  />
                </>
              )}
              <FormControl fullWidth error={!!errors.role}>
                <InputLabel>Role</InputLabel>
                <Select 
                  label="Role" 
                  value={watch('role')}
                  onChange={(e) => setValue('role', e.target.value as 'admin' | 'standard')}
                >
                  <MenuItem value="standard">Standard User</MenuItem>
                  <MenuItem value="admin">Administrator</MenuItem>
                </Select>
                {errors.role && (
                  <Typography color="error" variant="caption">
                    {errors.role.message}
                  </Typography>
                )}
              </FormControl>
              <FormControl fullWidth error={!!errors.broker_company}>
                <InputLabel>Company</InputLabel>
                <Select 
                  label="Company" 
                  value={watch('broker_company')}
                  onChange={(e) => setValue('broker_company', e.target.value)}
                >
                  {brokerCompanies.map((company) => (
                    <MenuItem key={company.id} value={company.ia_reg_code}>
                      {company.name} ({company.ia_reg_code})
                    </MenuItem>
                  ))}
                </Select>
                {errors.broker_company && (
                  <Typography color="error" variant="caption">
                    {errors.broker_company.message}
                  </Typography>
                )}
              </FormControl>
              <TextField
                label="TR Name"
                {...register('tr_name')}
                error={!!errors.tr_name}
                helperText={errors.tr_name?.message}
                fullWidth
              />
              <TextField
                label="TR License Number"
                {...register('tr_license_number')}
                error={!!errors.tr_license_number}
                helperText={errors.tr_license_number?.message}
                fullWidth
              />
              <TextField
                label="TR Phone Number"
                {...register('tr_phone_number')}
                error={!!errors.tr_phone_number}
                helperText={errors.tr_phone_number?.message}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedUser ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

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
}; 