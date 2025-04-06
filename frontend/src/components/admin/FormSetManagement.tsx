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
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { templateService, Template } from '../../services/templateService';
import { formSetService, FormSet, CreateFormSetData, UpdateFormSetData } from '../../services/formSetService';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  description: yup.string(),
  template_ids: yup.array().of(yup.string()).min(1, 'At least one template is required'),
});

export const FormSetManagement: React.FC = () => {
  const [formSets, setFormSets] = useState<FormSet[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFormSet, setSelectedFormSet] = useState<FormSet | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });
  
  useEffect(() => {
    fetchFormSets();
    fetchTemplates();
  }, []);
  
  const fetchFormSets = async () => {
    try {
      const data = await formSetService.getFormSets();
      setFormSets(data);
    } catch (err) {
      setError('Failed to fetch form sets');
    }
  };
  
  const fetchTemplates = async () => {
    try {
      const response = await templateService.getTemplates();
      setTemplates(Array.isArray(response) ? response : []);
    } catch (err) {
      setError('Failed to fetch templates');
    }
  };
  
  const handleOpenDialog = (formSet?: FormSet) => {
    if (formSet) {
      setSelectedFormSet(formSet);
      reset({
        name: formSet.name,
        description: formSet.description,
        template_ids: formSet.templates.map(t => t.id),
      });
    } else {
      setSelectedFormSet(null);
      reset({});
    }
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFormSet(null);
    reset({});
  };
  
  const onSubmit = async (data: any) => {
    try {
      if (selectedFormSet) {
        await formSetService.updateFormSet(selectedFormSet.id, {
          ...data,
          id: selectedFormSet.id,
        });
      } else {
        await formSetService.createFormSet(data);
      }
      
      handleCloseDialog();
      fetchFormSets();
    } catch (err) {
      setError('Failed to save form set');
    }
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this form set?')) {
      try {
        await formSetService.deleteFormSet(id);
        fetchFormSets();
      } catch (err) {
        setError('Failed to delete form set');
      }
    }
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Form Sets</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create Form Set
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
              <TableCell>Description</TableCell>
              <TableCell>Templates</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formSets.map((formSet) => (
              <TableRow key={formSet.id}>
                <TableCell>{formSet.name}</TableCell>
                <TableCell>{formSet.description}</TableCell>
                <TableCell>
                  <Chip
                    label={`${formSet.templates.length} templates`}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(formSet.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(formSet)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(formSet.id)}>
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
          {selectedFormSet ? 'Edit Form Set' : 'Create Form Set'}
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
                    rows={3}
                  />
                )}
              />
              
              <Controller
                name="template_ids"
                control={control}
                defaultValue={[]}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.template_ids}>
                    <InputLabel>Templates</InputLabel>
                    <Select
                      {...field}
                      multiple
                      label="Templates"
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(selected as string[]).map((value) => (
                            <Chip
                              key={value}
                              label={templates.find(t => t.id === value)?.name}
                              size="small"
                            />
                          ))}
                        </Box>
                      )}
                    >
                      {templates.map((template) => (
                        <MenuItem key={template.id} value={template.id}>
                          {template.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.template_ids && (
                      <Typography color="error" variant="caption">
                        {errors.template_ids.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedFormSet ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}; 