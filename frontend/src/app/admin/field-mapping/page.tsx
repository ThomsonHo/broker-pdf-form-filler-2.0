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
  system_field_name: yup.string().required('System field name is required'),
  field_type: yup.string().required('Field type is required'),
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

  const fetchTemplates = async () => {
    try {
      const response = await templateService.getTemplates();
      setTemplates(response.results);
    } catch (error) {
      console.error('Error fetching templates:', error);
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
      console.error('Error fetching standardized fields:', error);
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
      console.log('Field mappings response:', response);
      // Ensure response is an array
      const mappings = Array.isArray(response) ? response : [];
      setFieldMappings(mappings);
    } catch (error) {
      console.error('Error fetching field mappings:', error);
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

  const handleOpenDialog = (mapping?: FieldMapping) => {
    if (mapping) {
      setSelectedMapping(mapping);
      reset({
        pdf_field_name: mapping.pdf_field_name,
        system_field_name: mapping.system_field_name,
        field_type: mapping.field_type,
        validation_rules: mapping.validation_rules || '',
        transformation_rules: mapping.transformation_rules || '',
        field_definition_override: mapping.field_definition_override || '',
      });
    } else {
      setSelectedMapping(null);
      reset({});
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
      if (selectedMapping) {
        await templateService.updateFieldMapping(selectedTemplate.id, selectedMapping.id, data);
      } else {
        await templateService.createFieldMapping(selectedTemplate.id, data);
      }
      setSnackbar({
        open: true,
        message: `Field mapping ${selectedMapping ? 'updated' : 'created'} successfully`,
        severity: 'success',
      });
      handleCloseDialog();
      fetchFieldMappings(selectedTemplate.id);
    } catch (error) {
      console.error('Error saving field mapping:', error);
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
                  onClick={() => handleOpenDialog()}
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
                        <TableCell>System Field Name</TableCell>
                        <TableCell>Field Type</TableCell>
                        <TableCell>Validation Rules</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fieldMappings.map((mapping) => (
                        <TableRow key={mapping.id}>
                          <TableCell>{mapping.pdf_field_name}</TableCell>
                          <TableCell>{mapping.system_field_name}</TableCell>
                          <TableCell>{mapping.field_type}</TableCell>
                          <TableCell>{mapping.validation_rules || '-'}</TableCell>
                          <TableCell>
                            <IconButton onClick={() => handleOpenDialog(mapping)} size="small">
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
          {selectedMapping ? 'Edit Field Mapping' : 'Add Field Mapping'}
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
          <Box sx={{ display: 'grid', gap: 2, pt: 2 }}>
            <Controller
              name="pdf_field_name"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="PDF Field Name"
                  error={!!errors.pdf_field_name}
                  helperText={errors.pdf_field_name?.message}
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
                  fullWidth
                  label="System Field Name"
                  error={!!errors.system_field_name}
                  helperText={errors.system_field_name?.message}
                />
              )}
            />

            <Controller
              name="field_type"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.field_type}>
                  <InputLabel>Field Type</InputLabel>
                  <Select {...field} label="Field Type">
                    {FIELD_TYPES.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.field_type && (
                    <Typography color="error" variant="caption">
                      {errors.field_type.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />

            <Controller
              name="validation_rules"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Validation Rules"
                  multiline
                  rows={3}
                />
              )}
            />

            <Controller
              name="transformation_rules"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Transformation Rules"
                  multiline
                  rows={3}
                />
              )}
            />

            <Controller
              name="field_definition_override"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Field Definition Override"
                  multiline
                  rows={3}
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit(handleSave)} variant="contained" color="primary">
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