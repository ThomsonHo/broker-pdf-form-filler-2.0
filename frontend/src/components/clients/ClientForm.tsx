'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Divider,
  SelectChangeEvent,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { 
  Client, 
  createClient, 
  updateClient, 
  fetchClientById, 
  getClientFields,
  ClientField
} from '../../services/clientService';

interface ClientFormProps {
  clientId?: string;
  onSave?: (client: Client) => void;
  onCancel?: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ clientId, onSave, onCancel }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [fieldsLoading, setFieldsLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({
    id_number: '',
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [clientFields, setClientFields] = useState<ClientField[]>([]);

  // Load client fields and client data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load field definitions
        setFieldsLoading(true);
        const fields = await getClientFields();
        setClientFields(fields);
        setFieldsLoading(false);
        
        // Initialize form data with default values
        const initialData: Record<string, any> = { 
          id_number: '',
          is_active: true
        };
        
        // Set default values from field definitions
        fields.forEach(field => {
          if (field.default_value !== undefined && field.default_value !== null) {
            initialData[field.name] = field.default_value;
          } else {
            // Set empty defaults based on field type
            switch (field.field_type) {
              case 'text':
              case 'email':
              case 'phone':
              case 'textarea':
                initialData[field.name] = '';
                break;
              case 'number':
                initialData[field.name] = null;
                break;
              case 'date':
                initialData[field.name] = '';
                break;
              case 'checkbox':
                initialData[field.name] = false;
                break;
              case 'select':
              case 'radio':
                initialData[field.name] = '';
                break;
              default:
                initialData[field.name] = '';
            }
          }
        });
        
        setFormData(initialData);
        
        // If editing, load client data
        if (clientId) {
          setLoading(true);
          const client = await fetchClientById(clientId);
          
          // Populate form with client data
          const clientFormData = {
            id_number: client.id_number,
            is_active: client.is_active,
            ...client.data
          };
          
          // Add any direct fields from client that might not be in data
          fields.forEach(field => {
            if (client[field.name] !== undefined) {
              clientFormData[field.name] = client[field.name];
            }
          });
          
          setFormData(clientFormData);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
        setFieldsLoading(false);
      }
    };
    
    loadData();
  }, [clientId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const handleDateChange = (name: string, date: dayjs.Dayjs | null) => {
    if (date && date.isValid()) {
      // Format date as YYYY-MM-DD
      const formattedDate = date.format('YYYY-MM-DD');
      setFormData({
        ...formData,
        [name]: formattedDate,
      });
      // Clear error for this field
      if (errors[name]) {
        setErrors({
          ...errors,
          [name]: '',
        });
      }
    } else {
      // Clear the date if invalid
      setFormData({
        ...formData,
        [name]: '',
      });
      setErrors({
        ...errors,
        [name]: 'Please enter a valid date',
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validate id_number (required fixed field)
    if (!formData.id_number) {
      newErrors.id_number = 'ID number is required';
    }
    
    // Validate dynamic fields
    clientFields.forEach(field => {
      const value = formData[field.name];
      
      // Check required fields
      if (field.is_required && (value === undefined || value === null || value === '')) {
        newErrors[field.name] = `${field.label} is required`;
      }
      
      // Field-type specific validation
      if (value !== undefined && value !== null && value !== '') {
        switch (field.field_type) {
          case 'email':
            // Simple email validation
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              newErrors[field.name] = `${field.label} must be a valid email`;
            }
            break;
          case 'number':
            // Number validation
            if (isNaN(Number(value))) {
              newErrors[field.name] = `${field.label} must be a valid number`;
            }
            break;
          case 'phone':
            // Simple phone validation
            if (!/^\+?[\d\s-()]+$/.test(value)) {
              newErrors[field.name] = `${field.label} must be a valid phone number`;
            }
            break;
        }
      }
      
      // Apply custom validation rules if defined
      if (field.validation_rules && Array.isArray(field.validation_rules)) {
        // Handle custom validation rules
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Prepare data for submission
      const clientData: Partial<Client> = {
        id_number: formData.id_number,
        is_active: formData.is_active
      };
      
      // Add dynamic fields
      clientFields.forEach(field => {
        if (formData[field.name] !== undefined) {
          clientData[field.name] = formData[field.name];
        }
      });
      
      let savedClient: Client;
      
      if (clientId) {
        // Update existing client
        savedClient = await updateClient(clientId, clientData);
      } else {
        // Create new client
        savedClient = await createClient(clientData);
      }

      if (onSave) {
        onSave(savedClient);
      }
    } catch (err: any) {
      console.error('Error saving client:', err);
      
      // Handle different error cases
      if (err.response?.status === 401) {
        setError('You are not authorized. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to perform this action.');
      } else if (err.response?.status === 404) {
        setError('Client not found. Please refresh the page and try again.');
      } else if (err.response?.status === 405) {
        setError('The server does not support this operation. Please contact support.');
      } else if (err.response?.status === 422 || err.response?.status === 400) {
        // Handle validation errors
        const errorData = err.response?.data;
        if (typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData)
            .map(([field, message]) => `${field}: ${message}`)
            .join('\n');
          setError(`Validation error:\n${errorMessages}`);
        } else {
          setError(errorData?.message || errorData?.detail || 'Invalid data provided. Please check your input.');
        }
      } else {
        setError(err.response?.data?.message || err.response?.data?.detail || err.message || 'Failed to save client. Please try again later.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Render a field based on its type
  const renderField = (field: ClientField) => {
    console.log(`Rendering field: ${field.name}, type: ${field.field_type}`);
    
    const fieldValue = formData[field.name];
    const fieldError = errors[field.name] || '';
    
    // If field type is unsupported or undefined, default to text input
    if (!field.field_type) {
      console.warn(`Field ${field.name} has no field_type, defaulting to text`);
      field.field_type = 'text';
    }
    
    switch (field.field_type) {
      case 'text':
      case 'textarea':
      case 'string': // Add support for 'string' type
        return (
          <TextField
            key={field.name}
            fullWidth
            label={field.label}
            name={field.name}
            value={fieldValue || ''}
            onChange={handleChange}
            error={!!fieldError}
            helperText={fieldError || field.help_text}
            required={field.is_required}
            placeholder={field.placeholder}
            multiline={field.field_type === 'textarea'}
            rows={field.field_type === 'textarea' ? 4 : 1}
            margin="normal"
          />
        );
        
      case 'email':
        return (
          <TextField
            key={field.name}
            fullWidth
            label={field.label}
            name={field.name}
            value={fieldValue || ''}
            onChange={handleChange}
            error={!!fieldError}
            helperText={fieldError || field.help_text}
            required={field.is_required}
            placeholder={field.placeholder}
            type="email"
            margin="normal"
          />
        );
        
      case 'number':
      case 'integer': // Add support for 'integer' type
      case 'float': // Add support for 'float' type
        return (
          <TextField
            key={field.name}
            fullWidth
            label={field.label}
            name={field.name}
            value={fieldValue === null ? '' : fieldValue}
            onChange={handleChange}
            error={!!fieldError}
            helperText={fieldError || field.help_text}
            required={field.is_required}
            placeholder={field.placeholder}
            type="number"
            margin="normal"
          />
        );
        
      case 'phone':
      case 'tel': // Add support for 'tel' type
        return (
          <TextField
            key={field.name}
            fullWidth
            label={field.label}
            name={field.name}
            value={fieldValue || ''}
            onChange={handleChange}
            error={!!fieldError}
            helperText={fieldError || field.help_text}
            required={field.is_required}
            placeholder={field.placeholder}
            type="tel"
            margin="normal"
          />
        );
        
      case 'date':
        return (
          <LocalizationProvider key={field.name} dateAdapter={AdapterDayjs}>
            <DatePicker
              label={field.label}
              value={fieldValue ? dayjs(fieldValue) : null}
              onChange={(date) => handleDateChange(field.name, date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!fieldError,
                  helperText: fieldError || field.help_text,
                  required: field.is_required,
                  margin: "normal"
                }
              }}
            />
          </LocalizationProvider>
        );
        
      case 'select':
      case 'dropdown': // Add support for 'dropdown' type
      case 'choice': // Add support for 'choice' type
        // Create default options if none provided
        const options = field.options && Array.isArray(field.options) 
          ? field.options 
          : [{value: '', label: 'Select an option'}];
          
        return (
          <FormControl 
            key={field.name}
            fullWidth 
            error={!!fieldError}
            required={field.is_required}
            margin="normal"
          >
            <InputLabel>{field.label}</InputLabel>
            <Select
              name={field.name}
              value={fieldValue || ''}
              onChange={handleSelectChange}
              label={field.label}
            >
              {options.map((option: any) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{fieldError || field.help_text}</FormHelperText>
          </FormControl>
        );
        
      case 'checkbox':
      case 'boolean': // Add support for 'boolean' type
        return (
          <FormControl 
            key={field.name}
            fullWidth 
            error={!!fieldError}
            margin="normal"
          >
            <FormControlLabel
              control={
                <Checkbox
                  name={field.name}
                  checked={!!fieldValue}
                  onChange={handleCheckboxChange}
                />
              }
              label={field.label}
            />
            <FormHelperText>{fieldError || field.help_text}</FormHelperText>
          </FormControl>
        );
        
      default:
        console.warn(`Unknown field type "${field.field_type}" for field "${field.name}", defaulting to text input`);
        return (
          <TextField
            key={field.name}
            fullWidth
            label={field.label}
            name={field.name}
            value={fieldValue || ''}
            onChange={handleChange}
            error={!!fieldError}
            helperText={fieldError || field.help_text}
            required={field.is_required}
            margin="normal"
          />
        );
    }
  };

  // Group fields by category for better organization
  const renderFieldsByCategory = () => {
    console.log("Total client fields received:", clientFields.length);
    
    if (!clientFields || clientFields.length === 0) {
      return (
        <Box sx={{ mt: 2, mb: 4, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, bgcolor: '#f5f5f5' }}>
          <Typography variant="body1" color="text.secondary" align="center">
            No standardized fields found. Please contact an administrator to configure client fields.
          </Typography>
        </Box>
      );
    }
    
    // Group fields by display_category
    const fieldsByCategory: Record<string, ClientField[]> = {};
    clientFields.forEach(field => {
      // Ensure every field has a display category - use field_category as fallback
      const category = field.display_category || field.field_category || 'Other';
      
      if (!fieldsByCategory[category]) {
        fieldsByCategory[category] = [];
      }
      fieldsByCategory[category].push(field);
    });
    
    console.log("Fields grouped by category:", Object.keys(fieldsByCategory));
    Object.entries(fieldsByCategory).forEach(([category, fields]) => {
      console.log(`Category ${category} has ${fields.length} fields`);
    });
    
    // Render fields by category - sorted by display_order
    return Object.entries(fieldsByCategory).map(([category, fields]) => {
      // Sort fields by display_order
      const sortedFields = [...fields].sort((a, b) => 
        (a.display_order || 999) - (b.display_order || 999)
      );
      
      return (
        <Box key={category} sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {category}
          </Typography>
          <Grid container spacing={2}>
            {sortedFields.map(field => (
              <Grid item xs={12} sm={6} key={field.name}>
                {renderField(field)}
              </Grid>
            ))}
          </Grid>
          <Divider sx={{ mt: 2 }} />
        </Box>
      );
    });
  };

  if (loading || fieldsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        {clientId ? 'Edit Client' : 'Add New Client'}
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <form onSubmit={handleSubmit}>
        {/* Fixed Fields */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Client Identification
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ID Number"
                name="id_number"
                value={formData.id_number || ''}
                onChange={handleChange}
                error={!!errors.id_number}
                helperText={errors.id_number}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <FormControlLabel
                  control={
                    <Checkbox
                      name="is_active"
                      checked={!!formData.is_active}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="Active Client"
                />
              </FormControl>
            </Grid>
          </Grid>
          <Divider sx={{ mt: 2 }} />
        </Box>
        
        {/* Dynamic Fields */}
        {renderFieldsByCategory()}
        
        {/* Form Actions */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          {onCancel && (
            <Button 
              onClick={onCancel} 
              sx={{ mr: 2 }} 
              disabled={saving}
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={saving}
          >
            {saving ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Saving...
              </>
            ) : (
              'Save Client'
            )}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default ClientForm; 