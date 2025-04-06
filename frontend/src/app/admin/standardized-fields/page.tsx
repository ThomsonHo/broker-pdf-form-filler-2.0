'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
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
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { standardizedFieldService, StandardizedField } from '@/services/standardizedFieldService';

const fieldSchema = yup.object().shape({
  name: yup.string().required('Field name is required'),
  label: yup.string().required('Display label is required'),
  type: yup.string().required('Field type is required'),
  required: yup.boolean().default(false),
  validation: yup.object().shape({
    type: yup.string().optional(),
    message: yup.string().optional(),
    value: yup.mixed().optional(),
  }).optional(),
  relationships: yup.object().shape({
    type: yup.string().optional(),
    targetField: yup.string().optional(),
    condition: yup.object().shape({
      field: yup.string().optional(),
      operator: yup.string().optional(),
      value: yup.mixed().optional(),
    }).optional(),
  }).optional(),
});

type FieldFormData = yup.InferType<typeof fieldSchema>;

const FIELD_TYPES = [
  'text',
  'number',
  'date',
  'select',
  'multiselect',
  'checkbox',
  'radio',
  'file',
  'textarea',
  'email',
  'phone',
  'address',
  'currency',
  'percentage',
  'url',
  'password',
  'time',
  'datetime',
  'color',
  'range',
  'tel',
  'search',
  'week',
  'month',
  'datetime-local',
] as const;

export default function StandardizedFieldsPage() {
  const [fields, setFields] = useState<StandardizedField[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedField, setSelectedField] = useState<StandardizedField | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });
  const [showValidation, setShowValidation] = useState(false);
  const [showRelationships, setShowRelationships] = useState(false);
  const [showCondition, setShowCondition] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FieldFormData>({
    resolver: yupResolver(fieldSchema),
    defaultValues: {
      required: false,
    }
  });

  useEffect(() => {
    fetchFields();
  }, [page, rowsPerPage]);

  const fetchFields = async () => {
    try {
      setLoading(true);
      const response = await standardizedFieldService.getFields(page + 1, rowsPerPage);
      setFields(response.results);
      setTotalCount(response.count);
    } catch (error) {
      console.error('Error fetching fields:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching fields',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (field?: StandardizedField) => {
    if (field) {
      setSelectedField(field);
      reset({
        name: field.name,
        label: field.label,
        type: field.type,
        required: field.required,
        validation: field.validation || undefined,
        relationships: field.relationships || undefined,
      });
      setShowValidation(!!field.validation);
      setShowRelationships(!!field.relationships);
      setShowCondition(!!field.relationships?.condition);
    } else {
      setSelectedField(null);
      reset({
        name: '',
        label: '',
        type: 'text',
        required: false,
      });
      setShowValidation(false);
      setShowRelationships(false);
      setShowCondition(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedField(null);
    reset({});
    setShowValidation(false);
    setShowRelationships(false);
    setShowCondition(false);
  };

  const onSubmit = async (data: FieldFormData) => {
    try {
      // Clean up the data by removing empty validation and relationships
      const cleanedData = {
        ...data,
        validation: showValidation ? data.validation : undefined,
        relationships: showRelationships ? {
          ...data.relationships,
          condition: showCondition ? data.relationships?.condition : undefined,
        } : undefined,
      };

      if (selectedField) {
        await standardizedFieldService.updateField(selectedField.id, cleanedData);
        setSnackbar({
          open: true,
          message: 'Field updated successfully',
          severity: 'success',
        });
      } else {
        await standardizedFieldService.createField(cleanedData);
        setSnackbar({
          open: true,
          message: 'Field created successfully',
          severity: 'success',
        });
      }
      handleCloseDialog();
      fetchFields();
    } catch (error) {
      console.error('Error saving field:', error);
      setSnackbar({
        open: true,
        message: 'Error saving field',
        severity: 'error',
      });
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    if (window.confirm('Are you sure you want to delete this field?')) {
      try {
        await standardizedFieldService.deleteField(fieldId);
        setSnackbar({
          open: true,
          message: 'Field deleted successfully',
          severity: 'success',
        });
        fetchFields();
      } catch (error) {
        console.error('Error deleting field:', error);
        setSnackbar({
          open: true,
          message: 'Error deleting field',
          severity: 'error',
        });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Standardized Fields</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Field
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Label</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Required</TableCell>
              <TableCell>Validation</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((field) => (
              <TableRow key={field.id}>
                <TableCell>{field.name}</TableCell>
                <TableCell>{field.label}</TableCell>
                <TableCell>{field.type}</TableCell>
                <TableCell>{field.required ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  {field.validation ? (
                    <Typography variant="body2">
                      {field.validation.type}
                      {field.validation.message && `: ${field.validation.message}`}
                    </Typography>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpenDialog(field)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteField(field.id)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedField ? 'Edit Field' : 'Add Field'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Box display="grid" gap={2}>
              <TextField
                label="Field Name"
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
                fullWidth
              />
              <TextField
                label="Display Label"
                {...register('label')}
                error={!!errors.label}
                helperText={errors.label?.message}
                fullWidth
              />
              <FormControl fullWidth error={!!errors.type}>
                <InputLabel>Field Type</InputLabel>
                <Select
                  label="Field Type"
                  value={watch('type')}
                  onChange={(e) => setValue('type', e.target.value)}
                >
                  {FIELD_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
                {errors.type && (
                  <Typography color="error" variant="caption">
                    {String(errors.type)}
                  </Typography>
                )}
              </FormControl>
              <FormControlLabel
                control={
                  <Switch
                    {...register('required')}
                    checked={watch('required')}
                  />
                }
                label="Required Field"
              />
              
              {/* Validation Section */}
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showValidation}
                      onChange={(e) => setShowValidation(e.target.checked)}
                    />
                  }
                  label="Add Validation"
                />
                
                {showValidation && (
                  <Box display="grid" gap={2} sx={{ pl: 2, mt: 1 }}>
                    <FormControl fullWidth error={!!errors.validation?.type}>
                      <InputLabel>Validation Type</InputLabel>
                      <Select
                        label="Validation Type"
                        value={watch('validation.type') || ''}
                        onChange={(e) => setValue('validation.type', e.target.value)}
                      >
                        <MenuItem value="min">Minimum</MenuItem>
                        <MenuItem value="max">Maximum</MenuItem>
                        <MenuItem value="minLength">Minimum Length</MenuItem>
                        <MenuItem value="maxLength">Maximum Length</MenuItem>
                        <MenuItem value="pattern">Pattern</MenuItem>
                        <MenuItem value="email">Email</MenuItem>
                        <MenuItem value="url">URL</MenuItem>
                        <MenuItem value="phone">Phone</MenuItem>
                        <MenuItem value="custom">Custom</MenuItem>
                      </Select>
                      {errors.validation?.type && (
                        <Typography color="error" variant="caption">
                          {String(errors.validation.type)}
                        </Typography>
                      )}
                    </FormControl>
                    <TextField
                      label="Validation Message"
                      {...register('validation.message')}
                      error={!!errors.validation?.message}
                      helperText=""
                      fullWidth
                    />
                    <TextField
                      label="Validation Value"
                      {...register('validation.value')}
                      error={!!errors.validation?.value}
                      helperText=""
                      fullWidth
                    />
                  </Box>
                )}
              </Box>
              
              {/* Relationships Section */}
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showRelationships}
                      onChange={(e) => {
                        setShowRelationships(e.target.checked);
                        if (!e.target.checked) {
                          setShowCondition(false);
                        }
                      }}
                    />
                  }
                  label="Add Relationships"
                />
                
                {showRelationships && (
                  <Box display="grid" gap={2} sx={{ pl: 2, mt: 1 }}>
                    <FormControl fullWidth error={!!errors.relationships?.type}>
                      <InputLabel>Relationship Type</InputLabel>
                      <Select
                        label="Relationship Type"
                        value={watch('relationships.type') || ''}
                        onChange={(e) => setValue('relationships.type', e.target.value)}
                      >
                        <MenuItem value="dependency">Dependency</MenuItem>
                        <MenuItem value="visibility">Visibility</MenuItem>
                        <MenuItem value="calculation">Calculation</MenuItem>
                      </Select>
                      {errors.relationships?.type && (
                        <Typography color="error" variant="caption">
                          {String(errors.relationships.type)}
                        </Typography>
                      )}
                    </FormControl>
                    <TextField
                      label="Target Field"
                      {...register('relationships.targetField')}
                      error={!!errors.relationships?.targetField}
                      helperText=""
                      fullWidth
                    />
                    
                    {/* Condition Section */}
                    <Box>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={showCondition}
                            onChange={(e) => setShowCondition(e.target.checked)}
                          />
                        }
                        label="Add Condition"
                      />
                      
                      {showCondition && (
                        <Box display="grid" gap={2} sx={{ pl: 2, mt: 1 }}>
                          <TextField
                            label="Condition Field"
                            {...register('relationships.condition.field')}
                            error={!!errors.relationships?.condition?.field}
                            helperText=""
                            fullWidth
                          />
                          <FormControl fullWidth error={!!errors.relationships?.condition?.operator}>
                            <InputLabel>Condition Operator</InputLabel>
                            <Select
                              label="Condition Operator"
                              value={watch('relationships.condition.operator') || ''}
                              onChange={(e) => setValue('relationships.condition.operator', e.target.value)}
                            >
                              <MenuItem value="equals">Equals</MenuItem>
                              <MenuItem value="notEquals">Not Equals</MenuItem>
                              <MenuItem value="contains">Contains</MenuItem>
                              <MenuItem value="greaterThan">Greater Than</MenuItem>
                              <MenuItem value="lessThan">Less Than</MenuItem>
                              <MenuItem value="in">In</MenuItem>
                              <MenuItem value="notIn">Not In</MenuItem>
                            </Select>
                            {errors.relationships?.condition?.operator && (
                              <Typography color="error" variant="caption">
                                {String(errors.relationships.condition.operator)}
                              </Typography>
                            )}
                          </FormControl>
                          <TextField
                            label="Condition Value"
                            {...register('relationships.condition.value')}
                            error={!!errors.relationships?.condition?.value}
                            helperText=""
                            fullWidth
                          />
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedField ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
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