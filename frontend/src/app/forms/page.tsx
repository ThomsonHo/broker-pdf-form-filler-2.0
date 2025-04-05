'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import { FormGenerationWorkflow } from '@/components/forms/FormGenerationWorkflow';
import { FormBatchList } from '@/components/forms/FormBatchList';

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

export default function FormsPage() {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        PDF Forms
      </Typography>

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
          <FormGenerationWorkflow
            clientId="current-client-id" // This should be passed from the parent component
            clientData={{}} // This should be passed from the parent component
            onComplete={(batchId) => {
              console.log('Form generation completed:', batchId);
              setTabValue(1); // Switch to history tab
            }}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <FormBatchList />
        </TabPanel>
      </Paper>
    </Container>
  );
} 