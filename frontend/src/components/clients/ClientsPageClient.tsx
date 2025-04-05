'use client';

import React, { useState, useEffect } from 'react';
import { Box, Container, Dialog } from '@mui/material';
import ClientList from './ClientList';
import ClientForm from './ClientForm';
import ClientDetails from './ClientDetails';
import { Client } from '../../services/clientService';

const ClientsPageClient: React.FC = () => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  // Only render the component after it has mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddClient = () => {
    setSelectedClientId(null);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const handleEditClient = (clientId: string) => {
    setSelectedClientId(clientId);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleViewClient = (clientId: string) => {
    setSelectedClientId(clientId);
    setIsDetailsOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedClientId(null);
  };

  const handleDetailsClose = () => {
    setIsDetailsOpen(false);
    setSelectedClientId(null);
  };

  const handleFormSave = (client: Client) => {
    setIsFormOpen(false);
    setSelectedClientId(null);
    // Refresh the client list
    // This will be handled by the ClientList component's internal state
  };

  const handleEditFromDetails = () => {
    setIsDetailsOpen(false);
    if (selectedClientId) {
      setIsEditing(true);
      setIsFormOpen(true);
    }
  };

  // Return a placeholder during server-side rendering
  if (!mounted) {
    return <Container maxWidth="xl"><Box sx={{ py: 3 }}>Loading...</Box></Container>;
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <ClientList
          onAddClient={handleAddClient}
          onEditClient={handleEditClient}
          onViewClient={handleViewClient}
        />

        {/* Client Form Dialog */}
        <Dialog
          open={isFormOpen}
          onClose={handleFormClose}
          maxWidth="md"
          fullWidth
        >
          <ClientForm
            clientId={selectedClientId || undefined}
            onSave={handleFormSave}
            onCancel={handleFormClose}
          />
        </Dialog>

        {/* Client Details Dialog */}
        <Dialog
          open={isDetailsOpen}
          onClose={handleDetailsClose}
          maxWidth="md"
          fullWidth
        >
          {selectedClientId && (
            <ClientDetails
              clientId={selectedClientId}
              onEdit={handleEditFromDetails}
              onClose={handleDetailsClose}
            />
          )}
        </Dialog>
      </Box>
    </Container>
  );
};

export default ClientsPageClient; 