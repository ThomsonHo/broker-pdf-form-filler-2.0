'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { standardizedFieldService, StandardizedField, CreateStandardizedFieldData, UpdateStandardizedFieldData, ValidationRule, RelationshipRule, StandardizedFieldCategory } from '@/services/standardizedFieldService';
import { Add, Delete, Edit } from '@mui/icons-material';
import * as yup from 'yup';

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
] as const;

const FIELD_CATEGORIES = [
  { value: 'client', label: 'Client' },
  { value: 'user', label: 'User' },
  { value: 'broker', label: 'Broker' },
] as const;

const VALIDATION_TYPES = [
  'length',
  'pattern',
  'min',
  'max',
  'email',
  'url',
  'phone',
  'custom'
] as const;

const RELATIONSHIP_TYPES = [
  'dependency',
  'visibility',
  'calculation'
] as const;

const CONDITION_OPERATORS = [
  'equals',
  'not_equals',
  'contains',
  'greater_than',
  'less_than',
  'in',
  'not_in'
] as const;

const validationRuleSchema = yup.object().shape({
  type: yup.string().required('Validation type is required'),
  value: yup.mixed().required('Validation value is required'),
  message: yup.string().required('Validation message is required')
});

const relationshipRuleSchema = yup.object().shape({
  type: yup.string().optional(),
  target_field: yup.string().optional(),
  condition: yup.object().shape({
    field: yup.string().optional(),
    operator: yup.string().optional(),
    value: yup.mixed().optional()
  }).optional()
});

const validationSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  label: yup.string().required('Label is required'),
  llm_guide: yup.string().nullable(),
  is_required: yup.boolean(),
  field_category: yup.string().required('Field category is required'),
  display_category: yup.string().required('Display category is required'),
  field_type: yup.string().required('Field type is required'),
  field_definition: yup.string().nullable(),
  has_validation: yup.boolean(),
  validation_rules: yup.array(),
  has_relationship: yup.boolean(),
  relationship_rules: yup.array(),
  options: yup.object().default({}),
  default_value: yup.string().nullable(),
  placeholder: yup.string().nullable(),
  help_text: yup.string().nullable(),
  is_active: yup.boolean(),
  is_system: yup.boolean(),
  metadata: yup.object().default({}),
});

type FieldFormData = Omit<CreateStandardizedFieldData, 'options' | 'metadata'> & {
  options: Record<string, any>;
  metadata: Record<string, any>;
};

const defaultValues: FieldFormData = {
  name: '',
  label: '',
  llm_guide: '',
  is_required: false,
  field_category: FIELD_CATEGORIES[0].value,
  display_category: FIELD_CATEGORIES[0].label,
  field_type: FIELD_TYPES[0].value,
  field_definition: '',
  has_validation: false,
  validation_rules: [],
  has_relationship: false,
  relationship_rules: [],
  options: {},
  default_value: '',
  placeholder: '',
  help_text: '',
  is_active: true,
  is_system: false,
  metadata: {},
};

export default function StandardizedFieldsPage() {
  const [fields, setFields] = useState<StandardizedField[]>([]);
  const [categories, setCategories] = useState<StandardizedFieldCategory[]>([]);
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  const {
    register,
    handleSubmit: formHandleSubmit,
    reset,
    watch,
    formState: { errors },
    control,
  } = useForm<FieldFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues,
  });

  const { fields: validationFields, append, remove } = useFieldArray({
    control,
    name: 'validation_rules',
  });

  const { fields: relationshipFields, append: appendRelationship, remove: removeRelationship } = useFieldArray({
    control,
    name: 'relationship_rules',
  });

  const handleEdit = (field: StandardizedField) => {
    setSelectedField(field);
    reset({
      name: field.name,
      label: field.label,
      llm_guide: field.llm_guide || '',
      is_required: field.is_required,
      field_category: field.field_category,
      display_category: field.display_category,
      field_type: field.field_type,
      field_definition: field.field_definition || '',
      has_validation: field.has_validation,
      validation_rules: field.validation_rules,
      has_relationship: field.has_relationship,
      relationship_rules: field.relationship_rules,
      options: field.options || {},
      default_value: field.default_value || '',
      placeholder: field.placeholder || '',
      help_text: field.help_text || '',
      is_active: field.is_active,
      is_system: field.is_system,
      metadata: field.metadata || {},
    });
    setOpenDialog(true);
  };

  const handleCreate = () => {
    setSelectedField(null);
    reset(defaultValues);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedField(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const loadFields = async () => {
    try {
      setLoading(true);
      const [fieldsData, categoriesData] = await Promise.all([
        standardizedFieldService.getStandardizedFields({
          page: page + 1,
          page_size: rowsPerPage,
          search: debouncedSearchQuery,
          ordering: 'name'
        }),
        standardizedFieldService.getStandardizedFieldCategories()
      ]);
      setFields(fieldsData.results);
      setTotalCount(fieldsData.count);
      setCategories(categoriesData.results);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to load fields',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadFields();
  }, [page, rowsPerPage, debouncedSearchQuery]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  const onSubmit = async (data: FieldFormData) => {
    try {
      if (selectedField) {
        await standardizedFieldService.updateStandardizedField(selectedField.id, data);
        setSnackbar({
          open: true,
          message: 'Field updated successfully',
          severity: 'success',
        });
      } else {
        await standardizedFieldService.createStandardizedField(data);
        setSnackbar({
          open: true,
          message: 'Field created successfully',
          severity: 'success',
        });
      }
      handleCloseDialog();
      loadFields();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'An error occurred',
        severity: 'error',
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Standardized Fields</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreate}
        >
          Add Field
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by name or label..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <Box sx={{ mr: 1, color: 'text.secondary' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </Box>
            ),
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Label</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Required</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : fields.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No fields found
                </TableCell>
              </TableRow>
            ) : (
              fields.map((field) => (
                <TableRow key={field.id}>
                  <TableCell>{field.name}</TableCell>
                  <TableCell>{field.label}</TableCell>
                  <TableCell>{field.field_type}</TableCell>
                  <TableCell>{field.field_category}</TableCell>
                  <TableCell>{field.is_required ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleEdit(field)}
                      size="small"
                    >
                      <Edit />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedField ? 'Edit Field' : 'Add Field'}
        </DialogTitle>
        <form onSubmit={formHandleSubmit(onSubmit)}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Required fields */}
              <TextField
                {...register('name')}
                label="Name *"
                error={!!errors.name}
                helperText={errors.name?.message}
                fullWidth
              />
              <TextField
                {...register('label')}
                label="Label *"
                error={!!errors.label}
                helperText={errors.label?.message}
                fullWidth
              />
              <TextField
                {...register('llm_guide')}
                label="LLM Guide"
                multiline
                rows={3}
                fullWidth
              />
              <FormControlLabel
                control={<Switch {...register('is_required')} />}
                label="Required"
              />
              <FormControl fullWidth>
                <InputLabel>Field Category *</InputLabel>
                <Select
                  {...register('field_category')}
                  label="Field Category *"
                  error={!!errors.field_category}
                >
                  {FIELD_CATEGORIES.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Display Category *</InputLabel>
                <Select
                  {...register('display_category')}
                  label="Display Category *"
                  error={!!errors.display_category}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.name}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Field Type *</InputLabel>
                <Select
                  {...register('field_type')}
                  label="Field Type *"
                  error={!!errors.field_type}
                >
                  {FIELD_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Optional fields - hidden field_definition */}
              <TextField
                {...register('field_definition')}
                label="Field Definition"
                multiline
                rows={3}
                fullWidth
                sx={{ display: 'none' }}
              />

              {/* Rest of the optional fields */}
              <FormControlLabel
                control={<Switch {...register('has_validation')} />}
                label="Has Validation"
              />
              {watch('has_validation') && (
                <Box>
                  {validationFields.map((field, index) => (
                    <Box key={field.id} mb={2} p={2} border="1px solid" borderRadius={1}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="subtitle1">Validation Rule {index + 1}</Typography>
                        <IconButton onClick={() => remove(index)} size="small">
                          <Delete />
                        </IconButton>
                      </Box>
                      <FormControl fullWidth>
                        <InputLabel>Validation Type</InputLabel>
                        <Select
                          {...register(`validation_rules.${index}.type`)}
                          error={!!errors.validation_rules?.[index]?.type}
                        >
                          {VALIDATION_TYPES.map((type) => (
                            <MenuItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        label="Validation Value"
                        {...register(`validation_rules.${index}.value`)}
                        error={!!errors.validation_rules?.[index]?.value}
                        sx={{ mt: 1 }}
                      />
                      <TextField
                        fullWidth
                        label="Validation Message"
                        {...register(`validation_rules.${index}.message`)}
                        error={!!errors.validation_rules?.[index]?.message}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  ))}
                  <Button
                    variant="outlined"
                    onClick={() => append({ type: '', value: '', message: '' })}
                    startIcon={<Add />}
                    sx={{ mt: 1 }}
                  >
                    Add Validation Rule
                  </Button>
                </Box>
              )}
              <FormControlLabel
                control={<Switch {...register('has_relationship')} />}
                label="Has Relationship"
              />
              {watch('has_relationship') && (
                <Box>
                  {relationshipFields.map((field, index) => (
                    <Box key={field.id} mb={2} p={2} border="1px solid" borderRadius={1}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="subtitle1">Relationship Rule {index + 1}</Typography>
                        <IconButton onClick={() => removeRelationship(index)} size="small">
                          <Delete />
                        </IconButton>
                      </Box>
                      <FormControl fullWidth>
                        <InputLabel>Relationship Type</InputLabel>
                        <Select
                          {...register(`relationship_rules.${index}.type`)}
                          error={!!errors.relationship_rules?.[index]?.type}
                        >
                          {RELATIONSHIP_TYPES.map((type) => (
                            <MenuItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        label="Target Field"
                        {...register(`relationship_rules.${index}.target_field`)}
                        error={!!errors.relationship_rules?.[index]?.target_field}
                        sx={{ mt: 1 }}
                      />
                      <Box mt={2}>
                        <Typography variant="subtitle2">Condition (Optional)</Typography>
                        <TextField
                          fullWidth
                          label="Field"
                          {...register(`relationship_rules.${index}.condition.field`)}
                          error={!!errors.relationship_rules?.[index]?.condition?.field}
                          sx={{ mt: 1 }}
                        />
                        <FormControl fullWidth sx={{ mt: 1 }}>
                          <InputLabel>Operator</InputLabel>
                          <Select
                            {...register(`relationship_rules.${index}.condition.operator`)}
                            error={!!errors.relationship_rules?.[index]?.condition?.operator}
                          >
                            {CONDITION_OPERATORS.map((operator) => (
                              <MenuItem key={operator} value={operator}>
                                {operator.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <TextField
                          fullWidth
                          label="Value"
                          {...register(`relationship_rules.${index}.condition.value`)}
                          error={!!errors.relationship_rules?.[index]?.condition?.value}
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </Box>
                  ))}
                  <Button
                    variant="outlined"
                    onClick={() => appendRelationship({ type: '', target_field: '', condition: {} })}
                    startIcon={<Add />}
                    sx={{ mt: 1 }}
                  >
                    Add Relationship Rule
                  </Button>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
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