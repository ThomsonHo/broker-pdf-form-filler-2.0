import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, AutoFixHigh as AutoFixHighIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { standardizedFieldService, StandardizedField, CreateStandardizedFieldData, UpdateStandardizedFieldData } from '../../services/standardizedFieldService';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  description: yup.string(),
  field_type: yup.string().required('Field type is required'),
  validation_rules: yup.array().of(yup.string()),
  is_required: yup.boolean(),
  field_definition: yup.string().required('Field definition is required'),
  llm_guide: yup.string(),
  metadata: yup.object(),
});

const FIELD_TYPES = [
  'text',
  'number',
  'date',
  'email',
  'phone',
  'address',
  'select',
  'multiselect',
  'checkbox',
  'radio',
];

export const StandardizedFieldManagement: React.FC = () => {
  const [fields, setFields] = useState<StandardizedField[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedField, setSelectedField] = useState<StandardizedField | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { control, handleSubmit, reset, formState: { errors }, watch, setValue } = useForm({
    resolver: yupResolver(schema),
  });
  
  const fieldName = watch('name');
  const fieldType = watch('field_type');
  const fieldDefinition = watch('field_definition');
  
  useEffect(() => {
    fetchFields();
  }, []);
  
  const fetchFields = async () => {
    try {
      const data = await standardizedFieldService.getStandardizedFields();
      setFields(data);
    } catch (err) {
      setError('Failed to fetch standardized fields');
    }
  };
  
  const handleOpenDialog = (field?: StandardizedField) => {
    if (field) {
      setSelectedField(field);
      reset(field);
    } else {
      setSelectedField(null);
      reset({
        is_required: false,
        validation_rules: [],
        metadata: {},
      });
    }
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedField(null);
    reset({});
  };
  
  const onSubmit = async (data: any) => {
    try {
      if (selectedField) {
        await standardizedFieldService.updateStandardizedField(selectedField.id, {
          ...data,
          id: selectedField.id,
        });
      } else {
        await standardizedFieldService.createStandardizedField(data);
      }
      
      handleCloseDialog();
      fetchFields();
    } catch (err) {
      setError('Failed to save standardized field');
    }
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this standardized field?')) {
      try {
        await standardizedFieldService.deleteStandardizedField(id);
        fetchFields();
      } catch (err) {
        setError('Failed to delete standardized field');
      }
    }
  };
  
  const handleGenerateDefinition = async () => {
    if (!fieldName || !fieldType) {
      setError('Field name and type are required to generate definition');
      return;
    }
    
    try {
      setIsGenerating(true);
      const definition = await standardizedFieldService.generateFieldDefinition(fieldName, fieldType);
      setValue('field_definition', definition);
    } catch (err) {
      setError('Failed to generate field definition');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleGenerateLLMGuide = async () => {
    if (!fieldName || !fieldType || !fieldDefinition) {
      setError('Field name, type, and definition are required to generate LLM guide');
      return;
    }
    
    try {
      setIsGenerating(true);
      const guide = await standardizedFieldService.generateLLMGuide(fieldName, fieldType, fieldDefinition);
      setValue('llm_guide', guide);
    } catch (err) {
      setError('Failed to generate LLM guide');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSuggestValidationRules = async () => {
    if (!fieldName || !fieldType) {
      setError('Field name and type are required to suggest validation rules');
      return;
    }
    
    try {
      setIsGenerating(true);
      const rules = await standardizedFieldService.suggestValidationRules(fieldName, fieldType);
      setValue('validation_rules', rules);
    } catch (err) {
      setError('Failed to suggest validation rules');
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Standardized Fields</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create Field
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Required</TableCell>
              <TableCell>Validation Rules</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((field) => (
              <TableRow key={field.id}>
                <TableCell>{field.name}</TableCell>
                <TableCell>
                  <Chip label={field.field_type} size="small" />
                </TableCell>
                <TableCell>
                  <Chip
                    label={field.is_required ? 'Required' : 'Optional'}
                    color={field.is_required ? 'primary' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={0.5}>
                    {field.validation_rules.map((rule, index) => (
                      <Chip key={index} label={rule} size="small" />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  {new Date(field.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(field)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(field.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedField ? 'Edit Standardized Field' : 'Create Standardized Field'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Box display="grid" gap={2}>
              <Controller
                name="name"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Name"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
              
              <Controller
                name="description"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    multiline
                    rows={2}
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
                        <MenuItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
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
                name="is_required"
                control={control}
                defaultValue={false}
                render={({ field: { value, onChange } }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                      />
                    }
                    label="Required Field"
                  />
                )}
              />
              
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle2">Field Definition</Typography>
                  <Button
                    startIcon={<AutoFixHighIcon />}
                    onClick={handleGenerateDefinition}
                    disabled={isGenerating || !fieldName || !fieldType}
                  >
                    Generate
                  </Button>
                </Box>
                <Controller
                  name="field_definition"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={4}
                      error={!!errors.field_definition}
                      helperText={errors.field_definition?.message}
                    />
                  )}
                />
              </Box>
              
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle2">LLM Guide</Typography>
                  <Button
                    startIcon={<AutoFixHighIcon />}
                    onClick={handleGenerateLLMGuide}
                    disabled={isGenerating || !fieldName || !fieldType || !fieldDefinition}
                  >
                    Generate
                  </Button>
                </Box>
                <Controller
                  name="llm_guide"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={4}
                      helperText="Guidelines for LLM to understand and process this field"
                    />
                  )}
                />
              </Box>
              
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle2">Validation Rules</Typography>
                  <Button
                    startIcon={<AutoFixHighIcon />}
                    onClick={handleSuggestValidationRules}
                    disabled={isGenerating || !fieldName || !fieldType}
                  >
                    Suggest
                  </Button>
                </Box>
                <Controller
                  name="validation_rules"
                  control={control}
                  defaultValue={[]}
                  render={({ field }) => (
                    <Box display="flex" gap={0.5} flexWrap="wrap">
                      {(field.value || []).map((rule, index) => (
                        <Chip
                          key={index}
                          label={rule}
                          onDelete={() => {
                            const newRules = [...(field.value || [])];
                            newRules.splice(index, 1);
                            field.onChange(newRules);
                          }}
                        />
                      ))}
                    </Box>
                  )}
                />
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
    </Box>
  );
}; 