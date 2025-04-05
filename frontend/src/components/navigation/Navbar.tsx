'use client';

import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  useTheme,
  Menu,
  MenuItem,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { AccountCircle, ExitToApp, Menu as MenuIcon } from '@mui/icons-material';

export const Navbar: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Remove the authentication token
    localStorage.removeItem('token');
    // Redirect to login page
    router.push('/login');
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    handleClose();
  };

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleMenu}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Broker PDF Form Filler
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton color="inherit" size="large">
            <AccountCircle />
          </IconButton>
          <Button
            color="inherit"
            startIcon={<ExitToApp />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleNavigation('/dashboard')}>Dashboard</MenuItem>
        <MenuItem onClick={() => handleNavigation('/clients')}>Client Management</MenuItem>
        <MenuItem onClick={() => handleNavigation('/forms')}>PDF Forms</MenuItem>
        <MenuItem onClick={() => handleNavigation('/admin')}>Admin Panel</MenuItem>
      </Menu>
    </AppBar>
  );
}; 