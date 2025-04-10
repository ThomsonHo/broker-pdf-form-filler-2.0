'use client';

import React from 'react';
import { Box } from '@mui/material';
import ClientList from '@/components/clients/ClientList';
import { useRouter } from 'next/navigation';

const ClientsPage: React.FC = () => {
  const router = useRouter();

  const handleAddClient = () => {
    router.push('/clients/new');
  };

  const handleEditClient = (clientId: string) => {
    router.push(`/clients/${clientId}/edit`);
  };

  const handleViewClient = (clientId: string) => {
    router.push(`/clients/${clientId}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <ClientList
        onAddClient={handleAddClient}
        onEditClient={handleEditClient}
        onViewClient={handleViewClient}
      />
    </Box>
  );
};

export default ClientsPage; 