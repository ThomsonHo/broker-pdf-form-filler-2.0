'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Button,
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
} from '@mui/material';
import {
  DragIndicator as DragIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { templateService } from '@/services/templateService';

const fieldMappingSchema = yup.object().shape({
  pdf_field_name: yup.string().required('PDF field name is required'),
  system_field_name: yup.string().required('System field name is required'),
  field_type: yup.string().required('Field type is required'),
  transformation_rule: yup.string(),
});

type FieldMappingFormData = yup.InferType<typeof fieldMappingSchema>;

interface FieldMappingProps {
  templateId: string;
  onMappingUpdate?: () => void;
}

export const FieldMapping: React.FC<FieldMappingProps> = ({ templateId, onMappingUpdate }) => {
  const [mappings, setMappings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<any | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FieldMappingFormData>({
    resolver: yupResolver(fieldMappingSchema),
  });

  const fetchMappings = async () => {
    try {
      setLoading(true);
      const response = await templateService.getFieldMappings(templateId);
      setMappings(response);
    } catch (error) {
      console.error('Error fetching field mappings:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching field mappings',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMappings();
  }, [templateId]);

  const handleOpenDialog = (mapping?: any) => {
    if (mapping) {
      setSelectedMapping(mapping);
      reset(mapping);
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

  const handleFormSubmit = async (data: FieldMappingFormData) => {
    try {
      if (selectedMapping) {
        await templateService.updateFieldMapping(templateId, selectedMapping.id, data);
        setSnackbar({
          open: true,
          message: 'Field mapping updated successfully',
          severity: 'success',
        });
      } else {
        await templateService.createFieldMapping(templateId, data);
        setSnackbar({
          open: true,
          message: 'Field mapping created successfully',
          severity: 'success',
        });
      }
      handleCloseDialog();
      fetchMappings();
      if (onMappingUpdate) onMappingUpdate();
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
    if (window.confirm('Are you sure you want to delete this field mapping?')) {
      try {
        await templateService.deleteFieldMapping(templateId, mappingId);
        setSnackbar({
          open: true,
          message: 'Field mapping deleted successfully',
          severity: 'success',
        });
        fetchMappings();
        if (onMappingUpdate) onMappingUpdate();
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
        <Typography variant="h5">Field Mappings</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Mapping
        </Button>
      </Box>

      <Paper>
        <List>
          {mappings.map((mapping) => (
            <ListItem
              key={mapping.id}
              secondaryAction={
                <Box>
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={() => handleOpenDialog(mapping)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteMapping(mapping.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemIcon>
                <DragIcon />
              </ListItemIcon>
              <ListItemText
                primary={mapping.pdf_field_name}
                secondary={`Maps to: ${mapping.system_field_name} (${mapping.field_type})`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedMapping ? 'Edit Field Mapping' : 'Add Field Mapping'}
        </DialogTitle>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="PDF Field Name"
                  {...register('pdf_field_name')}
                  error={!!errors.pdf_field_name}
                  helperText={errors.pdf_field_name?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="System Field Name"
                  {...register('system_field_name')}
                  error={!!errors.system_field_name}
                  helperText={errors.system_field_name?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.field_type}>
                  <InputLabel>Field Type</InputLabel>
                  <Select
                    label="Field Type"
                    {...register('field_type')}
                  >
                    <MenuItem value="text">Text</MenuItem>
                    <MenuItem value="number">Number</MenuItem>
                    <MenuItem value="date">Date</MenuItem>
                    <MenuItem value="boolean">Boolean</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Transformation Rule"
                  {...register('transformation_rule')}
                  error={!!errors.transformation_rule}
                  helperText={errors.transformation_rule?.message}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedMapping ? 'Update' : 'Create'}
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
}; 