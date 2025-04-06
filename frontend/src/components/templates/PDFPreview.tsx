'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { FieldMapping } from '@/services/templateService';

interface PDFPreviewProps {
  templateId: string;
  fieldMappings: FieldMapping[];
  onSaveTestData?: (data: Record<string, string>) => void;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({
  templateId,
  fieldMappings,
  onSaveTestData,
}) => {
  const [testData, setTestData] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const handleTestDataChange = (fieldName: string, value: string) => {
    setTestData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSaveTestData = () => {
    if (onSaveTestData) {
      onSaveTestData(testData);
      setSnackbar({
        open: true,
        message: 'Test data saved successfully',
        severity: 'success',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Field Mappings Preview
      </Typography>
      
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>PDF Field Name</TableCell>
              <TableCell>System Field Name</TableCell>
              <TableCell>Field Type</TableCell>
              <TableCell>Test Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fieldMappings.map((mapping) => (
              <TableRow key={mapping.id}>
                <TableCell>{mapping.pdf_field_name}</TableCell>
                <TableCell>{mapping.system_field_name}</TableCell>
                <TableCell>{mapping.field_type}</TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    value={testData[mapping.pdf_field_name] || ''}
                    onChange={(e) => handleTestDataChange(mapping.pdf_field_name, e.target.value)}
                    fullWidth
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSaveTestData}
          disabled={Object.keys(testData).length === 0}
        >
          Save Test Data
        </Button>
      </Box>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 