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
import { userService, User } from '@/services/userService';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

const userSchema = yup.object().shape({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  role: yup.string().required('Role is required'),
  broker_company: yup.string().required('Company is required'),
  tr_name: yup.string(),
  tr_license_number: yup.string(),
  tr_phone_number: yup.string(),
  is_active: yup.boolean().default(true),
});

type UserFormData = yup.InferType<typeof userSchema>;

interface UserManagementProps {
  onRefresh?: () => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ onRefresh }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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
  } = useForm<UserFormData>({
    resolver: yupResolver(userSchema),
  });

  const fetchUsers = async () => {
    try {
      const response = await userService.listUsers({
        page: page + 1,
        page_size: rowsPerPage
      });
      setUsers(response.results);
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

  useEffect(() => {
    fetchUsers();
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
      reset(user);
    } else {
      setSelectedUser(null);
      reset({});
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    reset({});
  };

  const handleFormSubmit = async (data: UserFormData) => {
    try {
      if (selectedUser) {
        await userService.updateUser(selectedUser.id, data);
        setSnackbar({
          open: true,
          message: 'User updated successfully',
          severity: 'success',
        });
      } else {
        await userService.createUser(data);
        setSnackbar({
          open: true,
          message: 'User created successfully',
          severity: 'success',
        });
      }
      handleCloseDialog();
      fetchUsers();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error saving user:', error);
      setSnackbar({
        open: true,
        message: 'Error saving user',
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
            {users
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user) => (
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
          count={users.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2}>
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
              <TextField
                fullWidth
                label="Email"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  {...register('role')}
                  error={!!errors.role}
                  label="Role"
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Company"
                {...register('broker_company')}
                error={!!errors.broker_company}
                helperText={errors.broker_company?.message}
              />
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
              <TextField
                fullWidth
                label="TR Phone Number"
                {...register('tr_phone_number')}
                error={!!errors.tr_phone_number}
                helperText={errors.tr_phone_number?.message}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
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