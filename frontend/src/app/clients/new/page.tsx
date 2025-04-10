'use client';

import React from 'react';
import { Box } from '@mui/material';
import ClientForm from '@/components/clients/ClientForm';
import { useRouter } from 'next/navigation';
import { Client } from '@/services/clientService';

const NewClientPage: React.FC = () => {
  const router = useRouter();

  const handleCancel = () => {
    router.push('/clients');
  };

  const handleSave = (client: Client) => {
    router.push('/clients');
  };

  return (
    <Box sx={{ p: 3 }}>
      <ClientForm
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </Box>
  );
};

export default NewClientPage; 