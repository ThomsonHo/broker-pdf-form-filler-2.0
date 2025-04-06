'use client';

import { ReactNode } from 'react';
import { Box, Container, List, ListItem, ListItemIcon, ListItemText, Paper } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';

const menuItems = [
  { text: 'Dashboard', href: '/admin', icon: <DashboardIcon /> },
  { text: 'Users', href: '/admin/users', icon: <PeopleIcon /> },
  { text: 'Broker Companies', href: '/admin/broker-companies', icon: <BusinessIcon /> },
  // ... other menu items ...
];

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', gap: 2, py: 2 }}>
        <Paper sx={{ width: 240, p: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem
                key={item.href}
                component={Link as any}
                href={item.href}
                selected={pathname === item.href}
                sx={{
                  borderRadius: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Paper>
        <Box sx={{ flex: 1 }}>{children}</Box>
      </Box>
    </Container>
  );
} 