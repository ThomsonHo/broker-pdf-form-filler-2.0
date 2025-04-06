'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  Divider,
  Button,
} from '@mui/material';
import { Client, fetchClientById } from '../../services/clientService';
import { useRouter } from 'next/navigation';

interface ClientDetailsProps {
  clientId: string;
  onEdit?: () => void;
  onClose?: () => void;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ clientId, onEdit, onClose }) => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    const loadClient = async () => {
      try {
        const data = await fetchClientById(clientId);
        setClient(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load client details. Please try again later.');
        console.error('Error loading client details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadClient();
  }, [clientId]);

  const handleGenerateForms = () => {
    // Navigate to forms page with client ID
    router.push(`/forms?clientId=${clientId}`);
    if (onClose) {
      onClose();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !client) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography color="error" gutterBottom>
          {error || 'Client not found'}
        </Typography>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
      </Paper>
    );
  }

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Client Details
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleGenerateForms}
            sx={{ mr: 1 }}
          >
            Generate Forms
          </Button>
          {onEdit && (
            <Button
              variant="contained"
              color="primary"
              onClick={onEdit}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
          )}
          {onClose && (
            <Button
              variant="outlined"
              onClick={onClose}
            >
              Close
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Personal Information Section */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Personal Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Full Name
          </Typography>
          <Typography variant="body1">
            {`${client.first_name} ${client.last_name}`}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Date of Birth
          </Typography>
          <Typography variant="body1">
            {formatDate(client.date_of_birth)}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Gender
          </Typography>
          <Typography variant="body1">
            {client.gender === 'M' ? 'Male' : client.gender === 'F' ? 'Female' : 'Other'}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Marital Status
          </Typography>
          <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
            {client.marital_status}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            ID Number
          </Typography>
          <Typography variant="body1">
            {client.id_number}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Nationality
          </Typography>
          <Typography variant="body1">
            {client.nationality}
          </Typography>
        </Grid>

        {/* Contact Information Section */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Contact Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Phone Number
          </Typography>
          <Typography variant="body1">
            {client.phone_number || 'N/A'}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Email
          </Typography>
          <Typography variant="body1">
            {client.email || 'N/A'}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" color="text.secondary">
            Address
          </Typography>
          <Typography variant="body1">
            {client.address_line1}
            {client.address_line2 && <br />}
            {client.address_line2}
            <br />
            {`${client.city}, ${client.state} ${client.postal_code}`}
            <br />
            {client.country}
          </Typography>
        </Grid>

        {/* Employment Information Section */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Employment Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Employer
          </Typography>
          <Typography variant="body1">
            {client.employer || 'N/A'}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Occupation
          </Typography>
          <Typography variant="body1">
            {client.occupation || 'N/A'}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" color="text.secondary">
            Work Address
          </Typography>
          <Typography variant="body1">
            {client.work_address || 'N/A'}
          </Typography>
        </Grid>

        {/* Financial Information Section */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Financial Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Annual Income
          </Typography>
          <Typography variant="body1">
            {formatCurrency(client.annual_income)}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Monthly Expenses
          </Typography>
          <Typography variant="body1">
            {formatCurrency(client.monthly_expenses)}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Tax Residency
          </Typography>
          <Typography variant="body1">
            {client.tax_residency || 'N/A'}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Payment Method
          </Typography>
          <Typography variant="body1">
            {client.payment_method || 'N/A'}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Payment Period
          </Typography>
          <Typography variant="body1">
            {client.payment_period || 'N/A'}
          </Typography>
        </Grid>

        {/* Status Section */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Status
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12}>
          <Chip
            label={client.is_active ? 'Active' : 'Inactive'}
            color={client.is_active ? 'success' : 'default'}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ClientDetails; 