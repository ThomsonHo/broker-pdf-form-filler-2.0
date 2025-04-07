'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Check as CheckIcon, Error as ErrorIcon } from '@mui/icons-material';
import { templateService } from '@/services/templateService';

interface FieldMapping {
  id: string;
  pdf_field_name: string;
  system_field_name?: string;
  standardized_field_id?: string;
  validation_rules?: string;
}

interface ValidationResponse {
  valid: boolean;
  errors: string[];
}

interface FieldValidationProps {
  templateId: string;
  fieldMappings: FieldMapping[];
}

export const FieldValidation: React.FC<FieldValidationProps> = ({
  templateId,
  fieldMappings,
}) => {
  const [testData, setTestData] = useState<Record<string, string>>({});
  const [validationResults, setValidationResults] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleTestDataChange = (fieldName: string, value: string) => {
    setTestData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleValidateFields = async () => {
    if (!templateId) return;
    
    setLoading(true);
    try {
      const response = await templateService.validateFieldMappings(templateId);
      const results: Record<string, boolean> = {};
      
      fieldMappings.forEach(mapping => {
        if (mapping.pdf_field_name) {
          results[mapping.pdf_field_name] = !response.errors.some(error => 
            error.toLowerCase().includes(mapping.pdf_field_name.toLowerCase())
          );
        }
      });
      
      setValidationResults(results);
      setSnackbar({
        open: true,
        message: response.valid ? 'All fields are valid' : 'Some fields have validation errors',
        severity: response.valid ? 'success' : 'error'
      });
    } catch (error) {
      console.error('Error validating fields:', error);
      setSnackbar({
        open: true,
        message: 'Error validating fields',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getValidationStatus = (fieldName: string) => {
    const isValid = validationResults[fieldName];
    if (isValid === undefined) return null;
    return isValid ? <CheckIcon color="success" /> : <ErrorIcon color="error" />;
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Field Validation
        </Typography>
        <Box sx={{ mb: 2 }}>
          {fieldMappings.map((mapping) => (
            mapping.pdf_field_name && (
              <Box key={mapping.id} sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label={mapping.pdf_field_name}
                  value={testData[mapping.pdf_field_name] || ''}
                  onChange={(e) => handleTestDataChange(mapping.pdf_field_name, e.target.value)}
                  InputProps={{
                    endAdornment: getValidationStatus(mapping.pdf_field_name)
                  }}
                />
              </Box>
            )
          ))}
        </Box>
        <Button
          variant="contained"
          onClick={handleValidateFields}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Validate Fields'}
        </Button>
      </Paper>
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