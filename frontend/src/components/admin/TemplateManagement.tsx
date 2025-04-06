'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
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
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { templateService, FieldMapping, Template } from '@/services/templateService';
import { FieldMapping as FieldMappingComponent } from '@/components/templates/FieldMapping';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { PDFPreview } from '../templates/PDFPreview';
import { FieldValidation } from '../templates/FieldValidation';

const templateSchema = yup.object().shape({
  name: yup.string().required('Template name is required'),
  description: yup.string().required('Description is required'),
  category: yup.string().required('Category is required'),
  form_type: yup.string().required('Form type is required'),
  form_affiliation: yup.string().required('Form affiliation is required'),
  version: yup.string().required('Version is required'),
  is_active: yup.boolean().default(true),
});

type TemplateFormData = yup.InferType<typeof templateSchema>;

interface TemplateManagementProps {
  onRefresh?: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`template-tabpanel-${index}`}
      aria-labelledby={`template-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const TemplateManagement: React.FC<TemplateManagementProps> = ({ onRefresh }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isDeletable, setIsDeletable] = useState<boolean>(false);
  const [deletableTemplates, setDeletableTemplates] = useState<Record<string, boolean>>({});
  const [isClient, setIsClient] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    setIsClient(true);
    // Fetch templates after component is mounted on the client
    fetchTemplates();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TemplateFormData>({
    resolver: yupResolver(templateSchema),
    defaultValues: {
      is_active: true,
      form_type: 'application',
      form_affiliation: 'broker',
    }
  });

  const fetchTemplates = async () => {
    try {
      console.log('Fetching templates...');
      const response = await templateService.getTemplatesWithPagination(page, rowsPerPage);
      console.log('Templates response:', response);
      
      // Extract templates from the paginated response
      const templatesData = response.results || [];
      console.log('Templates array:', templatesData);
      
      setTemplates(templatesData);
      setTotalCount(response.count || 0);
      
      // Check if each template is deletable
      const deletableStatus: Record<string, boolean> = {};
      for (const template of templatesData) {
        try {
          const deletableResponse = await templateService.checkTemplateDeletable(template.id);
          deletableStatus[template.id] = deletableResponse.deletable;
        } catch (error) {
          console.error(`Error checking if template ${template.id} is deletable:`, error);
          deletableStatus[template.id] = false;
        }
      }
      setDeletableTemplates(deletableStatus);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching templates',
        severity: 'error',
      });
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    // Fetch the new page of templates
    fetchTemplatesWithPagination(newPage, rowsPerPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    // Fetch the first page with the new rows per page
    fetchTemplatesWithPagination(0, newRowsPerPage);
  };

  const fetchTemplatesWithPagination = async (page: number, rowsPerPage: number) => {
    try {
      setLoading(true);
      const response = await templateService.getTemplatesWithPagination(page, rowsPerPage);
      setTemplates(response.results || []);
      setTotalCount(response.count || 0);
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

  const handleOpenDialog = (template?: Template) => {
    if (template) {
      setSelectedTemplate(template);
      reset({
        name: template.name,
        description: template.description,
        category: template.category,
        form_type: template.form_type || 'application',
        form_affiliation: template.form_affiliation || 'broker',
        version: template.version,
        is_active: template.is_active,
      });
      setFileName(template.file_name || '');
      // Check if template is deletable (not bound to any form set)
      checkIfDeletable(template.id);
    } else {
      setSelectedTemplate(null);
      reset({
        name: '',
        description: '',
        category: '',
        form_type: 'application',
        form_affiliation: 'broker',
        version: '1.0',
        is_active: true,
      });
      setFileName('');
      setSelectedFile(null);
      setIsDeletable(true);
    }
    setOpenDialog(true);
  };

  const checkIfDeletable = async (templateId: string) => {
    try {
      // This would be a new API endpoint to check if a template is bound to any form set
      const response = await templateService.checkTemplateDeletable(templateId);
      setIsDeletable(response.deletable);
      // Update the deletable status in the state
      setDeletableTemplates(prev => ({
        ...prev,
        [templateId]: response.deletable
      }));
    } catch (error) {
      console.error('Error checking if template is deletable:', error);
      setIsDeletable(false);
      // Update the deletable status in the state
      setDeletableTemplates(prev => ({
        ...prev,
        [templateId]: false
      }));
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTemplate(null);
    reset({});
    setSelectedFile(null);
    setFileName('');
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      setFileName(file.name);
    }
  };

  const handleFormSubmit = async (data: TemplateFormData) => {
    try {
      // Debug: Log form data
      console.log('Form data:', data);
      
      // Create FormData object for file upload
      const formData = new FormData();
      
      // Add all form fields to FormData
      Object.keys(data).forEach(key => {
        if (data[key as keyof TemplateFormData] !== undefined && data[key as keyof TemplateFormData] !== null) {
          formData.append(key, String(data[key as keyof TemplateFormData]));
        }
      });
      
      // Add file if selected
      if (selectedFile) {
        formData.append('template_file', selectedFile);
        formData.append('file_name', selectedFile.name);
      }
      
      // Debug: Log FormData contents
      console.log('FormData being sent to server:');
      for (const pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      if (selectedTemplate) {
        // Update existing template
        await templateService.updateTemplate(selectedTemplate.id, formData);
        setSnackbar({
          open: true,
          message: 'Template updated successfully',
          severity: 'success',
        });
      } else {
        // Create new template
        if (!selectedFile) {
          setSnackbar({
            open: true,
            message: 'Please select a PDF file',
            severity: 'error',
          });
          return;
        }
        
        await templateService.createTemplate(formData);
        setSnackbar({
          open: true,
          message: 'Template created successfully',
          severity: 'success',
        });
      }
      handleCloseDialog();
      // Refresh templates with current pagination
      fetchTemplatesWithPagination(page, rowsPerPage);
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
    if (!deletableTemplates[templateId]) {
      setSnackbar({
        open: true,
        message: 'Cannot delete template that is bound to a form set',
        severity: 'error',
      });
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await templateService.deleteTemplate(templateId);
        setSnackbar({
          open: true,
          message: 'Template deleted successfully',
          severity: 'success',
        });
        // Refresh templates with current pagination
        fetchTemplatesWithPagination(page, rowsPerPage);
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
      setPreviewOpen(true);
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handlePreviewClick = async (template: Template) => {
    try {
      const url = await templateService.getTemplatePreview(template.id);
      setPreviewUrl(url);
      setPreviewOpen(true);
    } catch (error) {
      console.error('Error previewing template:', error);
      setSnackbar({
        open: true,
        message: 'Error previewing template',
        severity: 'error',
      });
    }
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewUrl(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          PDF Template Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add New Template
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Form Type</TableCell>
                <TableCell>Affiliation</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : templates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No templates found
                  </TableCell>
                </TableRow>
              ) : (
                templates
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>{template.name}</TableCell>
                      <TableCell>{template.category}</TableCell>
                      <TableCell>{template.form_type || 'N/A'}</TableCell>
                      <TableCell>{template.form_affiliation || 'N/A'}</TableCell>
                      <TableCell>{template.version}</TableCell>
                      <TableCell>
                        {template.is_active ? (
                          <Typography color="success.main">Active</Typography>
                        ) : (
                          <Typography color="error.main">Inactive</Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handlePreviewClick(template)}
                          title="Preview"
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDownloadTemplate(template.id)}
                          title="Download"
                        >
                          <DownloadIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(template)}
                          title="Edit"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteTemplate(template.id)}
                          title="Delete"
                          disabled={!deletableTemplates[template.id]}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Template Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedTemplate ? 'Edit Template' : 'Add New Template'}
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
        <DialogContent dividers>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
              <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                <TextField
                  fullWidth
                  label="Template Name"
                  {...register('name')}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              </Box>
              <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                <TextField
                  fullWidth
                  label="Version"
                  {...register('version')}
                  error={!!errors.version}
                  helperText={errors.version?.message}
                />
              </Box>
              <Box sx={{ gridColumn: 'span 12' }}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  {...register('description')}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              </Box>
              <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
                <FormControl fullWidth error={!!errors.category}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    label="Category"
                    value={isClient ? (watch('category') || 'broker') : 'broker'}
                    {...register('category')}
                  >
                    <MenuItem value="broker">Broker</MenuItem>
                    <MenuItem value="boclife">BOC Life</MenuItem>
                    <MenuItem value="chubb">Chubb</MenuItem>
                  </Select>
                  {errors.category && (
                    <Typography variant="caption" color="error">
                      {errors.category.message}
                    </Typography>
                  )}
                </FormControl>
              </Box>
              <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
                <FormControl fullWidth error={!!errors.form_type}>
                  <InputLabel>Form Type</InputLabel>
                  <Select
                    label="Form Type"
                    value={isClient ? (watch('form_type') || 'application') : 'application'}
                    {...register('form_type')}
                  >
                    <MenuItem value="fna">Financial Needs Analysis</MenuItem>
                    <MenuItem value="application">Application Form</MenuItem>
                    <MenuItem value="agreement">Agreement</MenuItem>
                    <MenuItem value="payment">Payment Form</MenuItem>
                  </Select>
                  {errors.form_type && (
                    <Typography variant="caption" color="error">
                      {errors.form_type.message}
                    </Typography>
                  )}
                </FormControl>
              </Box>
              <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
                <FormControl fullWidth error={!!errors.form_affiliation}>
                  <InputLabel>Form Affiliation</InputLabel>
                  <Select
                    label="Form Affiliation"
                    value={isClient ? (watch('form_affiliation') || 'broker') : 'broker'}
                    {...register('form_affiliation')}
                  >
                    <MenuItem value="broker">Broker</MenuItem>
                    <MenuItem value="insurance">Insurance Company</MenuItem>
                  </Select>
                  {errors.form_affiliation && (
                    <Typography variant="caption" color="error">
                      {errors.form_affiliation.message}
                    </Typography>
                  )}
                </FormControl>
              </Box>
              <Box sx={{ gridColumn: 'span 12' }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  PDF File
                </Typography>
                {selectedTemplate && !selectedFile && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Current file: {fileName}
                  </Typography>
                )}
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                  sx={{ mt: 1 }}
                >
                  {selectedFile ? 'Change PDF File' : 'Upload PDF File'}
                  <input
                    type="file"
                    hidden
                    accept=".pdf"
                    onChange={handleFileChange}
                  />
                </Button>
                {selectedFile && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Selected file: {selectedFile.name}
                  </Typography>
                )}
                {!selectedTemplate && !selectedFile && (
                  <Typography variant="caption" color="error">
                    PDF file is required
                  </Typography>
                )}
              </Box>
              <Box sx={{ gridColumn: 'span 12' }}>
                <FormControlLabel
                  control={
                    <Switch
                      {...register('is_active')}
                      checked={watch('is_active')}
                    />
                  }
                  label="Active"
                />
              </Box>
            </Box>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit(handleFormSubmit)} variant="contained" color="primary">
            {selectedTemplate ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          PDF Preview
          <IconButton
            aria-label="close"
            onClick={handleClosePreview}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {previewUrl && <PDFPreview url={previewUrl} />}
        </DialogContent>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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