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
import DescriptionIcon from '@mui/icons-material/Description';
import InfoIcon from '@mui/icons-material/Info';

interface NavbarProps {
  onDrawerToggle: () => void;
}

const pages = [
  { title: 'Dashboard', path: '/dashboard' },
  { title: 'Client Management', path: '/clients' },
  { title: 'PDF Forms', path: '/forms' },
];

const adminPages = [
  { title: 'Admin Panel', path: '/admin' },
];

export default function Navbar({ onDrawerToggle }: NavbarProps) {
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [userInfoAnchor, setUserInfoAnchor] = useState<null | HTMLElement>(null);
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleUserInfoOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserInfoAnchor(event.currentTarget);
  };

  const handleUserInfoClose = () => {
    setUserInfoAnchor(null);
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

          <DescriptionIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
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
            PDF FILLER
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <MenuItem
                key={page.title}
                onClick={() => router.push(page.path)}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page.title}
              </MenuItem>
            ))}
            {user?.role === 'admin' &&
              adminPages.map((page) => (
                <MenuItem
                  key={page.title}
                  onClick={() => router.push(page.path)}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  {page.title}
                </MenuItem>
              ))}
          </Box>

          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="User Information">
              <IconButton onClick={handleUserInfoOpen} sx={{ color: 'white' }}>
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

          <Menu
            sx={{ mt: '45px' }}
            id="user-info-menu"
            anchorEl={userInfoAnchor}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(userInfoAnchor)}
            onClose={handleUserInfoClose}
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
        </Toolbar>
      </Container>
    </AppBar>
  );
} 