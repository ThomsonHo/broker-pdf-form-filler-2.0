import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  useTheme,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { AccountCircle, ExitToApp } from '@mui/icons-material';

export const Navbar: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();

  const handleLogout = () => {
    // Remove the authentication token
    localStorage.removeItem('token');
    // Redirect to login page
    router.push('/login');
  };

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
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
    </AppBar>
  );
}; 