'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Save as SaveIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { templateService } from '@/services/templateService';

interface ValidationResult {
  fieldName: string;
  isValid: boolean;
  message?: string;
}

interface FieldValidationProps {
  templateId: string;
  fieldMappings: any[];
  onSaveTestData?: (data: any) => void;
}

export const FieldValidation: React.FC<FieldValidationProps> = ({
  templateId,
  fieldMappings,
  onSaveTestData,
}) => {
  const [testData, setTestData] = useState<Record<string, any>>({});
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const handleTestDataChange = (fieldName: string, value: any) => {
    setTestData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleValidateFields = async () => {
    try {
      setLoading(true);
      const results = await templateService.validateFieldMappings(templateId);
      
      const validationResults: ValidationResult[] = fieldMappings.map(mapping => {
        const value = testData[mapping.system_field_name];
        let isValid = true;
        let message = 'Valid';

        // Basic validation based on field type
        switch (mapping.field_type.toLowerCase()) {
          case 'number':
            isValid = !isNaN(Number(value));
            message = isValid ? 'Valid number' : 'Invalid number format';
            break;
          case 'date':
            isValid = !isNaN(Date.parse(value));
            message = isValid ? 'Valid date' : 'Invalid date format';
            break;
          case 'email':
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '');
            message = isValid ? 'Valid email' : 'Invalid email format';
            break;
          case 'phone':
            isValid = /^\+?[\d\s-()]+$/.test(value || '');
            message = isValid ? 'Valid phone number' : 'Invalid phone format';
            break;
          default:
            isValid = true;
            message = value ? 'Valid' : 'Empty field';
        }

        return {
          fieldName: mapping.system_field_name,
          isValid,
          message,
        };
      });

      setValidationResults(validationResults);

      const allValid = validationResults.every(result => result.isValid);
      setSnackbar({
        open: true,
        message: allValid ? 'All fields are valid' : 'Some fields have validation errors',
        severity: allValid ? 'success' : 'error',
      });
    } catch (error) {
      console.error('Error validating fields:', error);
      setSnackbar({
        open: true,
        message: 'Error validating fields',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
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

  const getValidationStatus = (fieldName: string) => {
    const result = validationResults.find(r => r.fieldName === fieldName);
    if (!result) return null;

    return (
      <Chip
        icon={result.isValid ? <CheckIcon /> : <ErrorIcon />}
        label={result.message}
        color={result.isValid ? 'success' : 'error'}
        size="small"
      />
    );
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Field Validation Testing</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Field Name</TableCell>
                  <TableCell>Field Type</TableCell>
                  <TableCell>Test Value</TableCell>
                  <TableCell>Validation Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fieldMappings.map((mapping) => (
                  <TableRow key={mapping.id}>
                    <TableCell>{mapping.system_field_name}</TableCell>
                    <TableCell>{mapping.field_type}</TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={testData[mapping.system_field_name] || ''}
                        onChange={(e) => handleTestDataChange(mapping.system_field_name, e.target.value)}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      {getValidationStatus(mapping.system_field_name)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="contained"
              startIcon={<PlayIcon />}
              onClick={handleValidateFields}
              disabled={loading || !fieldMappings.length}
            >
              {loading ? <CircularProgress size={24} /> : 'Validate Fields'}
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveTestData}
              disabled={loading || !fieldMappings.length}
            >
              Save Test Data
            </Button>
          </Box>
        </Grid>
      </Grid>

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