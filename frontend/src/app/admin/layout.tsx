'use client';

import { ReactNode } from 'react';
import { Box, Container } from '@mui/material';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 2 }}>
        {children}
      </Box>
    </Container>
  );
} 