'use client';

import React, { useEffect, useState, Suspense } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { FormGenerationWorkflow } from '@/components/forms/FormGenerationWorkflow';
import { FormBatchList } from '@/components/forms/FormBatchList';
import { useSearchParams } from 'next/navigation';
import { fetchClientById } from '@/services/clientService';
import { Client } from '@/services/clientService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`forms-tabpanel-${index}`}
      aria-labelledby={`forms-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function FormsContent() {
  const searchParams = useSearchParams();
  const [tabValue, setTabValue] = React.useState(0);
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientData, setClientData] = useState<Client | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get client ID from URL query parameters
    if (searchParams) {
      const clientIdParam = searchParams.get('clientId');
      if (clientIdParam) {
        setClientId(clientIdParam);
        loadClientData(clientIdParam);
      }
    }
  }, [searchParams]);

  const loadClientData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchClientById(id);
      setClientData(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load client data. Please try again later.');
      console.error('Error loading client data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        PDF Forms
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Generate Forms" />
          <Tab label="Form History" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <FormGenerationWorkflow
              clientId={clientId || ""}
              clientData={clientData || {}}
              onComplete={(batchId) => {
                console.log('Form generation completed:', batchId);
                setTabValue(1); // Switch to history tab
              }}
            />
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <FormBatchList />
        </TabPanel>
      </Paper>
    </Container>
  );
}

export default function FormsPage() {
  return (
    <Suspense fallback={
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    }>
      <FormsContent />
    </Suspense>
  );
} 