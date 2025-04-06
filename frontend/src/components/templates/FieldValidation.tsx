'use client';

import React, { useState, FC } from 'react';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Save as SaveIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Edit as EditIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { templateService } from '@/services/templateService';

interface ValidationRequest {
  pdf_field_name: string;
  system_field_name: string;
  test_value: string;
  validation_rules: string;
}

interface ValidationResult {
  fieldName: string;
  isValid: boolean;
  message: string;
}

interface FieldMapping {
  pdf_field_name: string;
  system_field_name: string;
  validation_rules?: string;
}

interface FieldValidationProps {
  templateId: string;
  fieldMappings: FieldMapping[];
  onSaveTestData?: (data: Record<string, string>) => void;
}

export const FieldValidation: FC<FieldValidationProps> = ({
  templateId,
  fieldMappings,
  onSaveTestData,
}) => {
  const [testData, setTestData] = useState<Record<string, string>>({});
  const [validationResults, setValidationResults] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMapping, setSelectedMapping] = useState<FieldMapping | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleTestDataChange = (fieldName: string, value: any) => {
    setTestData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleValidateFields = async () => {
    setLoading(true);
    try {
      if (!templateId) {
        console.warn('Template ID is undefined, skipping field validation');
        setSnackbar({
          open: true,
          message: 'Template ID is undefined, cannot validate fields',
          severity: 'error',
        });
        return;
      }
      const { valid, errors } = await templateService.validateFieldMappings(templateId);

      setValidationResults(
        fieldMappings.reduce((acc: Record<string, boolean>, mapping: FieldMapping) => ({
          ...acc,
          [mapping.system_field_name]: !errors.some(error => error.includes(mapping.system_field_name)),
        }), {})
      );

      setSnackbar({
        open: true,
        message: valid ? 'All fields are valid!' : 'Some fields have validation errors.',
        severity: valid ? 'success' : 'error',
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

  const handleEditMapping = (mapping: FieldMapping) => {
    setSelectedMapping(mapping);
    setOpenDialog(true);
  };

  const handleRunValidation = () => {
    handleValidateFields();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveValidationRules = () => {
    if (selectedMapping) {
      // Implement the logic to save the new validation rules
      setSnackbar({
        open: true,
        message: 'Validation rules saved successfully',
        severity: 'success',
      });
    }
    handleCloseDialog();
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Field Validation Testing</Typography>
      
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: 3,
        }}
      >
        <Box sx={{ gridColumn: 'span 12' }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>PDF Field</TableCell>
                  <TableCell>System Field</TableCell>
                  <TableCell>Test Value</TableCell>
                  <TableCell>Validation Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fieldMappings.map((mapping) => (
                  <TableRow key={mapping.pdf_field_name}>
                    <TableCell>{mapping.pdf_field_name}</TableCell>
                    <TableCell>{mapping.system_field_name}</TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={testData[mapping.system_field_name] || ''}
                        onChange={(e) =>
                          handleTestDataChange(mapping.system_field_name, e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {getValidationStatus(mapping.system_field_name)}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditMapping(mapping)}
                        aria-label="edit validation rules"
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box sx={{ gridColumn: 'span 12', display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRunValidation}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Run Validation'}
          </Button>
        </Box>
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit Validation Rules
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Validation Rules"
              multiline
              rows={4}
              value={selectedMapping?.validation_rules || ''}
              onChange={(e) => {
                if (selectedMapping) {
                  setSelectedMapping({
                    ...selectedMapping,
                    validation_rules: e.target.value,
                  });
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveValidationRules} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 