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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Client, createClient, updateClient, fetchClientById } from '../../services/clientService';

interface ClientFormProps {
  clientId?: string;
  onSave?: (client: Client) => void;
  onCancel?: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ clientId, onSave, onCancel }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Client>>({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'M',
    marital_status: 'single',
    id_number: '',
    nationality: '',
    phone_number: '',
    email: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    employer: '',
    occupation: '',
    work_address: '',
    annual_income: undefined,
    monthly_expenses: undefined,
    tax_residency: '',
    payment_method: '',
    payment_period: '',
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load client data if editing
  useEffect(() => {
    if (clientId) {
      setLoading(true);
      fetchClientById(clientId)
        .then((client) => {
          setFormData(client);
          setLoading(false);
        })
        .catch((err) => {
          setError('Failed to load client data. Please try again later.');
          console.error('Error loading client:', err);
          setLoading(false);
        });
    }
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

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date && date.isValid()) {
      // Format date as YYYY-MM-DD
      const formattedDate = date.format('YYYY-MM-DD');
      setFormData({
        ...formData,
        date_of_birth: formattedDate,
      });
    } else {
      // Clear the date if invalid
      setFormData({
        ...formData,
        date_of_birth: '',
      });
      setErrors({
        ...errors,
        date_of_birth: 'Please enter a valid date',
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    if (!formData.id_number) newErrors.id_number = 'ID number is required';
    if (!formData.nationality) newErrors.nationality = 'Nationality is required';
    if (!formData.phone_number && !formData.email) {
      newErrors.phone_number = 'Either phone number or email is required';
      newErrors.email = 'Either phone number or email is required';
    }
    if (!formData.address_line1) newErrors.address_line1 = 'Address line 1 is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State/province is required';
    if (!formData.postal_code) newErrors.postal_code = 'Postal code is required';
    if (!formData.country) newErrors.country = 'Country is required';

    // Email format validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Phone number format validation (basic)
    if (formData.phone_number && !/^\+?[\d\s-()]+$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Invalid phone number format';
    }

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
      let savedClient: Client;
      
      if (clientId) {
        // Update existing client
        console.log('Updating client with ID:', clientId);
        console.log('Form data:', formData);
        console.log('Update URL:', `/clients/${clientId}/`);
        savedClient = await updateClient(clientId, formData);
        console.log('Client updated successfully:', savedClient);
      } else {
        // Create new client
        console.log('Creating new client with data:', formData);
        console.log('Create URL:', '/clients/');
        savedClient = await createClient(formData);
        console.log('Client created successfully:', savedClient);
      }

      if (onSave) {
        onSave(savedClient);
      }
    } catch (err: any) {
      console.error('Error saving client:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      
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
        setError(err.response?.data?.message || err.response?.data?.detail || 'Failed to save client. Please try again later.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: 3,
          }}
        >
          {/* Personal Information Section */}
          <Box sx={{ gridColumn: 'span 12' }}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <TextField
              fullWidth
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              error={!!errors.first_name}
              helperText={errors.first_name}
              required
            />
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <TextField
              fullWidth
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              error={!!errors.last_name}
              helperText={errors.last_name}
              required
            />
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date of Birth"
                value={formData.date_of_birth ? dayjs(formData.date_of_birth) : null}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.date_of_birth,
                    helperText: errors.date_of_birth,
                    required: true,
                  },
                }}
              />
            </LocalizationProvider>
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <FormControl fullWidth error={!!errors.gender}>
              <InputLabel>Gender</InputLabel>
              <Select
                name="gender"
                value={formData.gender}
                onChange={handleSelectChange}
                label="Gender"
              >
                <MenuItem value="M">Male</MenuItem>
                <MenuItem value="F">Female</MenuItem>
                <MenuItem value="O">Other</MenuItem>
              </Select>
              {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
            </FormControl>
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <FormControl fullWidth error={!!errors.marital_status}>
              <InputLabel>Marital Status</InputLabel>
              <Select
                name="marital_status"
                value={formData.marital_status}
                onChange={handleSelectChange}
                label="Marital Status"
              >
                <MenuItem value="single">Single</MenuItem>
                <MenuItem value="married">Married</MenuItem>
                <MenuItem value="divorced">Divorced</MenuItem>
                <MenuItem value="widowed">Widowed</MenuItem>
              </Select>
              {errors.marital_status && <FormHelperText>{errors.marital_status}</FormHelperText>}
            </FormControl>
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <TextField
              fullWidth
              label="ID Number"
              name="id_number"
              value={formData.id_number}
              onChange={handleChange}
              error={!!errors.id_number}
              helperText={errors.id_number}
              required
            />
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <TextField
              fullWidth
              label="Nationality"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              error={!!errors.nationality}
              helperText={errors.nationality}
              required
            />
          </Box>

          {/* Contact Information Section */}
          <Box sx={{ gridColumn: 'span 12' }}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Contact Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <TextField
              fullWidth
              label="Phone Number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              error={!!errors.phone_number}
              helperText={errors.phone_number}
              required={!formData.email}
            />
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              required={!formData.phone_number}
            />
          </Box>

          <Box sx={{ gridColumn: 'span 12' }}>
            <TextField
              fullWidth
              label="Address Line 1"
              name="address_line1"
              value={formData.address_line1}
              onChange={handleChange}
              error={!!errors.address_line1}
              helperText={errors.address_line1}
              required
            />
          </Box>

          <Box sx={{ gridColumn: 'span 12' }}>
            <TextField
              fullWidth
              label="Address Line 2"
              name="address_line2"
              value={formData.address_line2}
              onChange={handleChange}
            />
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <TextField
              fullWidth
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              error={!!errors.city}
              helperText={errors.city}
              required
            />
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <TextField
              fullWidth
              label="State/Province"
              name="state"
              value={formData.state}
              onChange={handleChange}
              error={!!errors.state}
              helperText={errors.state}
              required
            />
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <TextField
              fullWidth
              label="Postal Code"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleChange}
              error={!!errors.postal_code}
              helperText={errors.postal_code}
              required
            />
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <TextField
              fullWidth
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              error={!!errors.country}
              helperText={errors.country}
              required
            />
          </Box>

          {/* Employment Information Section */}
          <Box sx={{ gridColumn: 'span 12' }}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Employment Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <TextField
              fullWidth
              label="Employer"
              name="employer"
              value={formData.employer}
              onChange={handleChange}
            />
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <TextField
              fullWidth
              label="Occupation"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
            />
          </Box>

          <Box sx={{ gridColumn: 'span 12' }}>
            <TextField
              fullWidth
              label="Work Address"
              name="work_address"
              value={formData.work_address}
              onChange={handleChange}
            />
          </Box>

          {/* Financial Information Section */}
          <Box sx={{ gridColumn: 'span 12' }}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Financial Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <TextField
              fullWidth
              label="Annual Income"
              name="annual_income"
              type="number"
              value={formData.annual_income || ''}
              onChange={handleChange}
              InputProps={{
                startAdornment: <span>$</span>,
              }}
            />
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <TextField
              fullWidth
              label="Monthly Expenses"
              name="monthly_expenses"
              type="number"
              value={formData.monthly_expenses || ''}
              onChange={handleChange}
              InputProps={{
                startAdornment: <span>$</span>,
              }}
            />
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <TextField
              fullWidth
              label="Tax Residency"
              name="tax_residency"
              value={formData.tax_residency}
              onChange={handleChange}
            />
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <TextField
              fullWidth
              label="Payment Method"
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
            />
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <TextField
              fullWidth
              label="Payment Period"
              name="payment_period"
              value={formData.payment_period}
              onChange={handleChange}
            />
          </Box>

          {/* Form Actions */}
          <Box sx={{ gridColumn: 'span 12', mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={onCancel}
              sx={{ mr: 1 }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={saving}
            >
              {saving ? <CircularProgress size={24} /> : clientId ? 'Update Client' : 'Add Client'}
            </Button>
          </Box>
        </Box>
      </form>
    </Paper>
  );
};

export default ClientForm; 