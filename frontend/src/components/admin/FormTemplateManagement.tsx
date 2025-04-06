import React, { useState, useEffect, ChangeEvent } from 'react';
import {
  Box,
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
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Upload as UploadIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { templateService, Template, CreateTemplateData, UpdateTemplateData } from '../../services/templateService';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  description: yup.string(),
  category: yup.string().required('Category is required'),
  form_type: yup.string().required('Form type is required'),
  form_affiliation: yup.string().required('Form affiliation is required'),
  version: yup.string().required('Version is required'),
  template_file: yup.mixed().required('PDF file is required'),
});

interface ExtendedTemplate extends Template {
  form_type: string;
  form_affiliation: string;
}

export const FormTemplateManagement: React.FC = () => {
  const [templates, setTemplates] = useState<ExtendedTemplate[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ExtendedTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });
  
  useEffect(() => {
    fetchTemplates();
  }, []);
  
  const fetchTemplates = async () => {
    try {
      const response = await templateService.getTemplates();
      const templates = Array.isArray(response) ? response : [];
      setTemplates(templates.map(template => ({
        ...template,
        form_type: 'application',
        form_affiliation: 'broker',
      })));
    } catch (err) {
      setError('Failed to fetch templates');
    }
  };
  
  const handleOpenDialog = (template?: ExtendedTemplate) => {
    if (template) {
      setSelectedTemplate(template);
      reset(template);
    } else {
      setSelectedTemplate(null);
      reset({});
    }
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTemplate(null);
    setSelectedFile(null);
    reset({});
  };
  
  const onSubmit = async (data: any) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'template_file' && data[key] instanceof File) {
          formData.append('file', data[key]);
        } else {
          formData.append(key, data[key]);
        }
      });
      
      if (selectedTemplate) {
        await templateService.updateTemplate(selectedTemplate.id, formData as unknown as UpdateTemplateData);
      } else {
        await templateService.createTemplate(formData as unknown as CreateTemplateData);
      }
      
      handleCloseDialog();
      fetchTemplates();
    } catch (err) {
      setError('Failed to save template');
    }
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await templateService.deleteTemplate(id);
        fetchTemplates();
      } catch (err) {
        setError('Failed to delete template');
      }
    }
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Form Templates</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<UploadIcon />}
          onClick={() => handleOpenDialog()}
        >
          Upload Template
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
              <TableCell>Category</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Affiliation</TableCell>
              <TableCell>Version</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id}>
                <TableCell>{template.name}</TableCell>
                <TableCell>{template.category}</TableCell>
                <TableCell>{template.form_type}</TableCell>
                <TableCell>{template.form_affiliation}</TableCell>
                <TableCell>{template.version}</TableCell>
                <TableCell>
                  <Chip
                    label={template.is_active ? 'Active' : 'Inactive'}
                    color={template.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(template)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(template.id)}>
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
          {selectedTemplate ? 'Edit Template' : 'Upload Template'}
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
                name="category"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.category}>
                    <InputLabel>Category</InputLabel>
                    <Select {...field} label="Category">
                      <MenuItem value="broker">Broker</MenuItem>
                      <MenuItem value="boclife">BOC Life</MenuItem>
                      <MenuItem value="chubb">Chubb</MenuItem>
                    </Select>
                    {errors.category && (
                      <Typography color="error" variant="caption">
                        {errors.category.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
              
              <Controller
                name="form_type"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.form_type}>
                    <InputLabel>Form Type</InputLabel>
                    <Select {...field} label="Form Type">
                      <MenuItem value="fna">Financial Needs Analysis</MenuItem>
                      <MenuItem value="application">Application Form</MenuItem>
                      <MenuItem value="agreement">Agreement</MenuItem>
                      <MenuItem value="payment">Payment Form</MenuItem>
                    </Select>
                    {errors.form_type && (
                      <Typography color="error" variant="caption">
                        {errors.form_type.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
              
              <Controller
                name="form_affiliation"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.form_affiliation}>
                    <InputLabel>Form Affiliation</InputLabel>
                    <Select {...field} label="Form Affiliation">
                      <MenuItem value="broker">Broker</MenuItem>
                      <MenuItem value="insurance">Insurance Company</MenuItem>
                    </Select>
                    {errors.form_affiliation && (
                      <Typography color="error" variant="caption">
                        {errors.form_affiliation.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
              
              <Controller
                name="version"
                control={control}
                defaultValue="1.0"
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Version"
                    fullWidth
                    error={!!errors.version}
                    helperText={errors.version?.message}
                  />
                )}
              />
              
              <Controller
                name="template_file"
                control={control}
                render={({ field: { onChange, ...field } }) => (
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFile(file);
                        onChange(file);
                      }
                    }}
                    style={{ display: 'none' }}
                    id="template-file-input"
                  />
                )}
              />
              <label htmlFor="template-file-input">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                >
                  {selectedFile ? selectedFile.name : 'Choose PDF File'}
                </Button>
                {errors.template_file && (
                  <Typography color="error" variant="caption" display="block">
                    {errors.template_file.message}
                  </Typography>
                )}
              </label>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedTemplate ? 'Update' : 'Upload'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}; 