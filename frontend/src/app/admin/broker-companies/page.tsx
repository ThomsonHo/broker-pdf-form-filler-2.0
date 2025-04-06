'use client';

import { Box, Container } from '@mui/material';
import BrokerCompanyManagement from '@/components/admin/BrokerCompanyManagement';

export default function BrokerCompaniesPage() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <BrokerCompanyManagement />
      </Box>
    </Container>
  );
} 