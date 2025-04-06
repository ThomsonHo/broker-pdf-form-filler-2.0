import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { userService, BrokerCompany } from '@/services/userService';

export default function BrokerCompanyManagement() {
  const [brokerCompanies, setBrokerCompanies] = useState<BrokerCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<BrokerCompany | null>(null);
  const [formData, setFormData] = useState<Partial<BrokerCompany>>({});
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchBrokerCompanies();
  }, []);

  const fetchBrokerCompanies = async () => {
    try {
      const companies = await userService.getBrokerCompanies();
      setBrokerCompanies(companies);
    } catch (error) {
      console.error('Error fetching broker companies:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching broker companies',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (company?: BrokerCompany) => {
    if (company) {
      setSelectedCompany(company);
      setFormData(company);
    } else {
      setSelectedCompany(null);
      setFormData({});
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCompany(null);
    setFormData({});
  };

  const handleSubmit = async () => {
    try {
      if (selectedCompany) {
        await userService.updateBrokerCompany(selectedCompany.ia_reg_code, formData);
        setSnackbar({
          open: true,
          message: 'Broker company updated successfully',
          severity: 'success',
        });
      } else {
        await userService.createBrokerCompany(formData as Omit<BrokerCompany, 'created_at' | 'updated_at' | 'user_count'>);
        setSnackbar({
          open: true,
          message: 'Broker company created successfully',
          severity: 'success',
        });
      }
      handleCloseDialog();
      fetchBrokerCompanies();
    } catch (error) {
      console.error('Error saving broker company:', error);
      setSnackbar({
        open: true,
        message: 'Error saving broker company',
        severity: 'error',
      });
    }
  };

  const handleDelete = async (iaRegCode: string) => {
    if (window.confirm('Are you sure you want to delete this broker company?')) {
      try {
        await userService.deleteBrokerCompany(iaRegCode);
        setSnackbar({
          open: true,
          message: 'Broker company deleted successfully',
          severity: 'success',
        });
        fetchBrokerCompanies();
      } catch (error) {
        console.error('Error deleting broker company:', error);
        setSnackbar({
          open: true,
          message: 'Error deleting broker company',
          severity: 'error',
        });
      }
    }
  };

  const handleChange = (field: keyof BrokerCompany) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Broker Companies</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Broker Company
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>IA Reg Code</TableCell>
              <TableCell>MPFA Reg Code</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Contact Email</TableCell>
              <TableCell>Users</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {brokerCompanies.map((company) => (
              <TableRow key={company.id}>
                <TableCell>{company.name}</TableCell>
                <TableCell>{company.ia_reg_code}</TableCell>
                <TableCell>{company.mpfa_reg_code}</TableCell>
                <TableCell>{company.phone_number}</TableCell>
                <TableCell>{company.address}</TableCell>
                <TableCell>{company.contact_email}</TableCell>
                <TableCell>{company.user_count}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(company)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(company.ia_reg_code)}
                  >
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
          {selectedCompany ? 'Edit Broker Company' : 'Add Broker Company'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, pt: 2 }}>
            <TextField
              label="Company Name"
              value={formData.name || ''}
              onChange={handleChange('name')}
              fullWidth
              required
            />
            <TextField
              label="IA Registration Code"
              value={formData.ia_reg_code || ''}
              onChange={handleChange('ia_reg_code')}
              fullWidth
              required
              disabled={!!selectedCompany}
              inputProps={{ maxLength: 6 }}
            />
            <TextField
              label="MPFA Registration Code"
              value={formData.mpfa_reg_code || ''}
              onChange={handleChange('mpfa_reg_code')}
              fullWidth
              required
              inputProps={{ maxLength: 8 }}
            />
            <TextField
              label="Phone Number"
              value={formData.phone_number || ''}
              onChange={handleChange('phone_number')}
              fullWidth
              required
            />
            <TextField
              label="Address"
              value={formData.address || ''}
              onChange={handleChange('address')}
              fullWidth
              required
              multiline
              rows={3}
              defaultValue="Hong Kong"
            />
            <TextField
              label="Responsible Officer Email"
              value={formData.responsible_officer_email || ''}
              onChange={handleChange('responsible_officer_email')}
              fullWidth
              required
              type="email"
            />
            <TextField
              label="Contact Email"
              value={formData.contact_email || ''}
              onChange={handleChange('contact_email')}
              fullWidth
              required
              type="email"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedCompany ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 