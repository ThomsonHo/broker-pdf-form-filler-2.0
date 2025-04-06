'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  MenuItem,
  Tooltip,
  Paper,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import InfoIcon from '@mui/icons-material/Info';

interface NavbarProps {
  onDrawerToggle: () => void;
}

const Navbar = ({ onDrawerToggle }: NavbarProps) => {
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [anchorElInfo, setAnchorElInfo] = useState<null | HTMLElement>(null);
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenUserInfoPopup = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElInfo(event.currentTarget);
  };

  const handleCloseUserInfoPopup = () => {
    setAnchorElInfo(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleCloseUserMenu();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleProfile = () => {
    router.push('/users/profile');
    handleCloseUserMenu();
  };

  const handleChangePassword = () => {
    router.push('/users/change-password');
    handleCloseUserMenu();
  };

  return (
    <AppBar position="fixed">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Broker CRM & PDF Form Filler
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="User Information">
              <IconButton onClick={handleOpenUserInfoPopup} sx={{ color: 'white' }}>
                <InfoIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt={user?.email} src="/static/images/avatar/2.jpg" />
              </IconButton>
            </Tooltip>
          </Box>

          <Menu
            sx={{ mt: '45px' }}
            id="menu-user-info"
            anchorEl={anchorElInfo}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorElInfo)}
            onClose={handleCloseUserInfoPopup}
          >
            <Paper sx={{ p: 2, minWidth: 200 }}>
              <Typography variant="subtitle1" gutterBottom>
                User Information
              </Typography>
              <Typography variant="body2">Email: {user?.email}</Typography>
              <Typography variant="body2">Role: {user?.role}</Typography>
              <Typography variant="body2">
                Superuser: {user?.is_superuser ? 'Yes' : 'No'}
              </Typography>
              {user?.created_at && (
                <Typography variant="body2">
                  Created: {new Date(user.created_at).toLocaleDateString()}
                </Typography>
              )}
            </Paper>
          </Menu>

          <Menu
            sx={{ mt: '45px' }}
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            <MenuItem onClick={handleProfile}>
              <Typography textAlign="center">Profile</Typography>
            </MenuItem>
            <MenuItem onClick={handleChangePassword}>
              <Typography textAlign="center">Change Password</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Typography textAlign="center">Logout</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 