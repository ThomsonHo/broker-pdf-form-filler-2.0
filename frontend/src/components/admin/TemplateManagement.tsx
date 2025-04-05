'use client';

import React, { useState, useEffect } from 'react';
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
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { templateService } from '@/services/templateService';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

const templateSchema = yup.object().shape({
  name: yup.string().required('Template name is required'),
  description: yup.string().required('Description is required'),
  category: yup.string().required('Category is required'),
  version: yup.string().required('Version is required'),
  is_active: yup.boolean().default(true),
});

type TemplateFormData = yup.InferType<typeof templateSchema>;

interface TemplateManagementProps {
  onRefresh?: () => void;
}

export const TemplateManagement: React.FC<TemplateManagementProps> = ({ onRefresh }) => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
  } = useForm<TemplateFormData>({
    resolver: yupResolver(templateSchema),
  });

  const fetchTemplates = async () => {
    try {
      const response = await templateService.getTemplates();
      setTemplates(response);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching templates',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (template?: any) => {
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
    reset({});
  };

  const handleFormSubmit = async (data: TemplateFormData) => {
    try {
      if (selectedTemplate) {
        await templateService.updateTemplate(selectedTemplate.id, data);
        setSnackbar({
          open: true,
          message: 'Template updated successfully',
          severity: 'success',
        });
      } else {
        const fileInput = document.getElementById('template-file') as HTMLInputElement;
        const file = fileInput?.files?.[0] || new File([], 'empty.pdf', { type: 'application/pdf' });
        
        await templateService.createTemplate({
          ...data,
          file
        });
        setSnackbar({
          open: true,
          message: 'Template created successfully',
          severity: 'success',
        });
      }
      handleCloseDialog();
      fetchTemplates();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error saving template:', error);
      setSnackbar({
        open: true,
        message: 'Error saving template',
        severity: 'error',
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await templateService.deleteTemplate(templateId);
        setSnackbar({
          open: true,
          message: 'Template deleted successfully',
          severity: 'success',
        });
        fetchTemplates();
        if (onRefresh) onRefresh();
      } catch (error) {
        console.error('Error deleting template:', error);
        setSnackbar({
          open: true,
          message: 'Error deleting template',
          severity: 'error',
        });
      }
    }
  };

  const handlePreviewTemplate = async (templateId: string) => {
    try {
      const url = await templateService.getTemplatePreview(templateId);
      setPreviewUrl(url);
    } catch (error) {
      console.error('Error previewing template:', error);
      setSnackbar({
        open: true,
        message: 'Error previewing template',
        severity: 'error',
      });
    }
  };

  const handleDownloadTemplate = async (templateId: string) => {
    try {
      await templateService.downloadTemplate(templateId);
      setSnackbar({
        open: true,
        message: 'Template downloaded successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error downloading template:', error);
      setSnackbar({
        open: true,
        message: 'Error downloading template',
        severity: 'error',
      });
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
        <Typography variant="h4">Template Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Template
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Version</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((template) => (
                <TableRow key={template.id}>
                  <TableCell>{template.name}</TableCell>
                  <TableCell>{template.category}</TableCell>
                  <TableCell>{template.version}</TableCell>
                  <TableCell>
                    {template.is_active ? 'Active' : 'Inactive'}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handlePreviewTemplate(template.id)}
                      size="small"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDownloadTemplate(template.id)}
                      size="small"
                    >
                      <DownloadIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleOpenDialog(template)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteTemplate(template.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={templates.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedTemplate ? 'Edit Template' : 'Add New Template'}
        </DialogTitle>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                fullWidth
                label="Template Name"
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                {...register('description')}
                error={!!errors.description}
                helperText={errors.description?.message}
              />
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  {...register('category')}
                  error={!!errors.category}
                  label="Category"
                >
                  <MenuItem value="insurance">Insurance</MenuItem>
                  <MenuItem value="investment">Investment</MenuItem>
                  <MenuItem value="retirement">Retirement</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Version"
                {...register('version')}
                error={!!errors.version}
                helperText={errors.version?.message}
              />
              <input
                type="file"
                id="template-file"
                accept=".pdf"
                style={{ display: 'none' }}
              />
              <Button
                variant="outlined"
                component="label"
                htmlFor="template-file"
                fullWidth
              >
                Upload PDF Template
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedTemplate ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog
        open={!!previewUrl}
        onClose={() => setPreviewUrl(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Template Preview</DialogTitle>
        <DialogContent>
          {previewUrl && (
            <iframe
              src={previewUrl}
              style={{ width: '100%', height: '500px' }}
              title="Template Preview"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewUrl(null)}>Close</Button>
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