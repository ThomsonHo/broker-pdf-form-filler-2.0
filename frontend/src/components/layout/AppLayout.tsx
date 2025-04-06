'use client';

import React, { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import Navbar from '@/components/navigation/Navbar';
import NavigationDrawer from '@/components/navigation/Drawer';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar onDrawerToggle={handleDrawerToggle} />
      <NavigationDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${240}px)` },
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
} 