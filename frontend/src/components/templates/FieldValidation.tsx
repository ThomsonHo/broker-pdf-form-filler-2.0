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
  system_field_name: string;
  field_type: string;
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
    setTestData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleValidateFields = async () => {
    setLoading(true);
    try {
      const response = await templateService.validateFieldMappings(templateId);
      // Initialize all fields as valid, then mark invalid ones based on errors
      const results: Record<string, boolean> = {};
      fieldMappings.forEach(mapping => {
        results[mapping.system_field_name] = true;
      });
      response.errors.forEach(error => {
        // Assuming error messages contain the field name
        fieldMappings.forEach(mapping => {
          if (error.includes(mapping.system_field_name)) {
            results[mapping.system_field_name] = false;
          }
        });
      });
      setValidationResults(results);
      setSnackbar({
        open: true,
        message: response.valid ? 'All fields are valid!' : 'Some fields have validation errors.',
        severity: response.valid ? 'success' : 'error',
      });
    } catch (error) {
      console.error('Validation error:', error);
      setSnackbar({
        open: true,
        message: 'Failed to validate fields',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getValidationStatus = (fieldName: string) => {
    const result = validationResults[fieldName];
    if (result === undefined) return null;

    return (
      <Chip
        icon={result ? <CheckIcon /> : <ErrorIcon />}
        label={result ? 'Valid' : 'Invalid'}
        color={result ? 'success' : 'error'}
        size="small"
      />
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Field Validation
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          {fieldMappings.map((mapping) => (
            <Box key={mapping.id}>
              <TextField
                fullWidth
                label={mapping.system_field_name}
                value={testData[mapping.system_field_name] || ''}
                onChange={(e) => handleTestDataChange(mapping.system_field_name, e.target.value)}
                helperText={mapping.validation_rules || 'No validation rules'}
              />
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleValidateFields}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Validate Fields'}
          </Button>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Field Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Validation Rules</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fieldMappings.map((mapping) => (
              <TableRow key={mapping.id}>
                <TableCell>{mapping.system_field_name}</TableCell>
                <TableCell>{mapping.field_type}</TableCell>
                <TableCell>{mapping.validation_rules || '-'}</TableCell>
                <TableCell>{getValidationStatus(mapping.system_field_name)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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