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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  SelectChangeEvent,
} from '@mui/material';
import {
  DragIndicator as DragIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { templateService } from '@/services/templateService';
import { FieldMapping as FieldMappingType } from '@/services/templateService';

interface ExtendedFieldMappingType extends FieldMappingType {
  validation_rules?: string;
}

const fieldMappingSchema = yup.object().shape({
  pdf_field_name: yup.string().required('PDF field name is required'),
  system_field_name: yup.string().required('System field name is required'),
  field_type: yup.string().required('Field type is required'),
  validation_rules: yup.string(),
});

type FieldMappingFormData = yup.InferType<typeof fieldMappingSchema>;

interface FieldMappingProps {
  templateId: string;
  fieldMappings: ExtendedFieldMappingType[];
  onSave: (mappings: ExtendedFieldMappingType[]) => void;
}

export const FieldMapping: React.FC<FieldMappingProps> = ({
  templateId,
  fieldMappings,
  onSave,
}) => {
  const [mappings, setMappings] = useState<ExtendedFieldMappingType[]>(fieldMappings);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<ExtendedFieldMappingType | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const [formData, setFormData] = useState({
    pdf_field_name: '',
    system_field_name: '',
    field_type: '',
    validation_rules: '',
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
      if (!templateId) {
        console.warn('Template ID is undefined, skipping field mapping fetch');
        setMappings([]);
        return;
      }
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

  const handleOpenDialog = (mapping?: ExtendedFieldMappingType) => {
    if (mapping) {
      setSelectedMapping(mapping);
      setFormData({
        pdf_field_name: mapping.pdf_field_name,
        system_field_name: mapping.system_field_name,
        field_type: mapping.field_type,
        validation_rules: mapping.validation_rules || '',
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

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await fieldMappingSchema.validate(formData);
      if (selectedMapping) {
        await templateService.updateFieldMapping(templateId, selectedMapping.id, formData);
      } else {
        await templateService.createFieldMapping(templateId, formData);
      }
      setSnackbar({
        open: true,
        message: `Field mapping ${selectedMapping ? 'updated' : 'created'} successfully`,
        severity: 'success',
      });
      handleCloseDialog();
      fetchMappings();
      onSave(mappings);
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
        onSave(mappings);
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>PDF Field Name</TableCell>
              <TableCell>System Field Name</TableCell>
              <TableCell>Field Type</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mappings.map((mapping) => (
              <TableRow key={mapping.id}>
                <TableCell>{mapping.pdf_field_name}</TableCell>
                <TableCell>{mapping.system_field_name}</TableCell>
                <TableCell>{mapping.field_type}</TableCell>
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
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
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: '1fr',
              pt: 2,
            }}
          >
            <TextField
              fullWidth
              label="PDF Field Name"
              name="pdf_field_name"
              value={formData.pdf_field_name}
              onChange={handleTextChange}
            />
            <TextField
              fullWidth
              label="System Field Name"
              name="system_field_name"
              value={formData.system_field_name}
              onChange={handleTextChange}
            />
            <FormControl fullWidth>
              <InputLabel>Field Type</InputLabel>
              <Select
                name="field_type"
                value={formData.field_type}
                onChange={handleSelectChange}
                label="Field Type"
              >
                <MenuItem value="text">Text</MenuItem>
                <MenuItem value="number">Number</MenuItem>
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="checkbox">Checkbox</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Validation Rules"
              name="validation_rules"
              value={formData.validation_rules}
              onChange={handleTextChange}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
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
}; 