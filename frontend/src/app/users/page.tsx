'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { UserList } from '@/components/users/UserList';
import { UserForm } from '@/components/users/UserForm';
import { userService, User } from '@/services/userService';
import { useAuth } from '@/hooks/useAuth';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (selectedUser) {
        await userService.updateUser(selectedUser.id, data);
        setSnackbar({
          open: true,
          message: 'User updated successfully',
          severity: 'success',
        });
      } else {
        await userService.registerUser(data);
        setSnackbar({
          open: true,
          message: 'User created successfully',
          severity: 'success',
        });
      }
      setIsFormOpen(false);
      setSelectedUser(undefined);
      // Refresh user list
      const response = await userService.listUsers();
      setUsers(response.results);
    } catch (error) {
      console.error('Error saving user:', error);
      setSnackbar({
        open: true,
        message: 'Error saving user',
        severity: 'error',
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await userService.deleteUser(userToDelete);
      setSnackbar({
        open: true,
        message: 'User deleted successfully',
        severity: 'success',
      });
      // Refresh user list
      const response = await userService.listUsers();
      setUsers(response.results);
    } catch (error) {
      console.error('Error deleting user:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting user',
        severity: 'error',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          User Management
        </Typography>
        {currentUser?.role === 'admin' && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedUser(undefined);
              setIsFormOpen(true);
            }}
          >
            Add User
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 2 }}>
        <UserList onEditUser={handleEditUser} onDeleteUser={handleDeleteUser} />
      </Paper>

      <UserForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedUser(undefined);
        }}
        onSubmit={handleFormSubmit}
        user={selectedUser}
        title={selectedUser ? 'Edit User' : 'Add User'}
      />

      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this user? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
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
} 