'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Divider,
  SelectChangeEvent,
  Stack,
  FormHelperText,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { templateService, Template, FieldMapping } from '@/services/templateService';
import { standardizedFieldService, StandardizedField } from '@/services/standardizedFieldService';
import { FieldValidation } from '@/components/templates/FieldValidation';

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Select' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'ssn', label: 'SSN' },
  { value: 'address', label: 'Address' },
  { value: 'signature', label: 'Signature' },
];

// Extended interface for form data - no longer needed since fields are in base interface
type ExtendedFieldMapping = FieldMapping;

const fieldMappingSchema = yup.object().shape({
  pdf_field_name: yup.string().required('PDF field name is required'),
  system_field_name: yup.string(),
  standardized_field_id: yup.string().uuid('Must be a valid UUID'),
  validation_rules: yup.string(),
  transformation_rules: yup.string(),
  field_definition_override: yup.string(),
});

type FieldMappingFormData = yup.InferType<typeof fieldMappingSchema>;

export default function FieldMappingPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [standardizedFields, setStandardizedFields] = useState<StandardizedField[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<FieldMapping | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<FieldMappingFormData>({
    resolver: yupResolver(fieldMappingSchema),
    defaultValues: {
      pdf_field_name: '',
      system_field_name: '',
      standardized_field_id: ''
    }
  });

  useEffect(() => {
    fetchTemplates();
    fetchStandardizedFields();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      fetchFieldMappings(selectedTemplate.id);
    }
  }, [selectedTemplate]);

  useEffect(() => {
    // If we have a selected mapping, set the form values
    if (selectedMapping) {
      const standardizedFieldId = selectedMapping.standardized_field_id || selectedMapping.standardized_field?.id || '';
      reset({
        pdf_field_name: selectedMapping.pdf_field_name,
        system_field_name: selectedMapping.system_field_name || '',
        standardized_field_id: standardizedFieldId
      });
    }
  }, [selectedMapping, reset]);

  const fetchTemplates = async () => {
    try {
      const response = await templateService.getTemplates();
      setTemplates(response.results);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error fetching templates',
        severity: 'error',
      });
    }
  };

  const fetchStandardizedFields = async () => {
    try {
      const response = await standardizedFieldService.getStandardizedFields();
      setStandardizedFields(response.results);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error fetching standardized fields',
        severity: 'error',
      });
    }
  };

  const fetchFieldMappings = async (templateId: string) => {
    try {
      setLoading(true);
      const response = await templateService.getFieldMappings(templateId);
      // Ensure response is an array
      const mappings = Array.isArray(response) ? response : [];
      setFieldMappings(mappings);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error fetching field mappings',
        severity: 'error',
      });
      // Initialize as empty array on error
      setFieldMappings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (event: SelectChangeEvent<string>) => {
    const templateId = event.target.value;
    const template = templates.find(t => t.id === templateId) || null;
    setSelectedTemplate(template);
  };

  const handleEdit = (mapping: FieldMapping | null) => {
    setSelectedMapping(mapping);
    if (mapping) {
      // Get the standardized field ID from either standardized_field_id or standardized_field.id
      const standardizedFieldId = mapping.standardized_field?.id || mapping.standardized_field_id || '';
      
      // Initialize form data
      const formData = {
        pdf_field_name: mapping.pdf_field_name,
        system_field_name: mapping.system_field_name || '',
        standardized_field_id: standardizedFieldId
      };
      
      // Reset the form with the mapping data
      reset(formData);
    } else {
      // Reset form for new mapping
      reset({
        pdf_field_name: '',
        system_field_name: '',
        standardized_field_id: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMapping(null);
    reset({});
  };

  const handleSave = async (data: FieldMappingFormData) => {
    if (!selectedTemplate) return;
    
    try {
      // Ensure standardized_field_id is properly set
      const formData = {
        ...data,
        standardized_field_id: data.standardized_field_id || undefined
      };
      
      if (selectedMapping) {
        await templateService.updateFieldMapping(selectedTemplate.id, selectedMapping.id, formData);
      } else {
        await templateService.createFieldMapping(selectedTemplate.id, formData);
      }
      setSnackbar({
        open: true,
        message: `Field mapping ${selectedMapping ? 'updated' : 'created'} successfully`,
        severity: 'success',
      });
      handleCloseDialog();
      fetchFieldMappings(selectedTemplate.id);
    } catch (error: any) {
      if (error.response) {
        if (error.response.data.template) {
        }
      }
      setSnackbar({
        open: true,
        message: 'Error saving field mapping',
        severity: 'error',
      });
    }
  };

  const handleDeleteMapping = async (mappingId: string) => {
    if (!selectedTemplate) return;
    
    if (window.confirm('Are you sure you want to delete this field mapping?')) {
      try {
        await templateService.deleteFieldMapping(selectedTemplate.id, mappingId);
        setSnackbar({
          open: true,
          message: 'Field mapping deleted successfully',
          severity: 'success',
        });
        fetchFieldMappings(selectedTemplate.id);
      } catch (error) {
        console.error('Error deleting field mapping:', error);
        setSnackbar({
          open: true,
          message: 'Error deleting field mapping',
          severity: 'error',
        });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Field Mapping Management
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Select Template</InputLabel>
          <Select
            value={selectedTemplate?.id || ''}
            onChange={handleTemplateChange}
            label="Select Template"
          >
            {templates.map((template) => (
              <MenuItem key={template.id} value={template.id}>
                {template.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {selectedTemplate && (
        <>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
            <Tab label="Field Mappings" />
            <Tab label="Validation" />
          </Tabs>

          {activeTab === 0 && (
            <Box>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Field Mappings</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => handleEdit(null)}
                >
                  Add Field Mapping
                </Button>
              </Box>

              {loading ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>PDF Field Name</TableCell>
                        <TableCell>Standardized Field</TableCell>
                        <TableCell>Field Type</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fieldMappings
                        .sort((a, b) => a.pdf_field_name.toLowerCase().localeCompare(b.pdf_field_name.toLowerCase()))
                        .map((mapping) => (
                        <TableRow key={mapping.id}>
                          <TableCell>{mapping.pdf_field_name}</TableCell>
                          <TableCell>
                            {mapping.standardized_field?.name || '-'}
                          </TableCell>
                          <TableCell>
                            {mapping.standardized_field?.field_type || '-'}
                          </TableCell>
                          <TableCell>
                            <IconButton onClick={() => handleEdit(mapping)} size="small">
                              <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => handleDeleteMapping(mapping.id)} size="small">
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {activeTab === 1 && selectedTemplate && (
            <FieldValidation
              templateId={selectedTemplate.id}
              fieldMappings={fieldMappings}
            />
          )}
        </>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedMapping ? 'Edit Field Mapping' : 'Create Field Mapping'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit(handleSave)} sx={{ mt: 2 }}>
            <Stack spacing={2}>
              <Controller
                name="pdf_field_name"
                control={control}
                defaultValue=""
                rules={{ required: 'PDF Field Name is required' }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="PDF Field Name"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
              <Controller
                name="system_field_name"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="System Field Name"
                    fullWidth
                    value={field.value || ''}
                  />
                )}
              />
              <Controller
                name="standardized_field_id"
                control={control}
                defaultValue=""
                rules={{ required: 'Standardized Field is required' }}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <InputLabel>Standardized Field</InputLabel>
                    <Select
                      {...field}
                      value={field.value || ''}
                      label="Standardized Field"
                    >
                      {standardizedFields.map((field) => (
                        <MenuItem key={field.id} value={field.id}>
                          {field.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {error && (
                      <FormHelperText>{error.message}</FormHelperText>
                    )}
                    {selectedMapping?.standardized_field && !field.value && (
                      <FormHelperText>
                        Current: {selectedMapping.standardized_field.name}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit(handleSave)}
            variant="contained"
            color="primary"
          >
            {selectedMapping ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

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
} 