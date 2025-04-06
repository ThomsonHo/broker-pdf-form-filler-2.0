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
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { templateService, FieldMapping } from '@/services/templateService';
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
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handlePreviewClick = async (template: any) => {
    try {
      setSelectedTemplate(template);
      const mappings = await templateService.getFieldMappings(template.id);
      setFieldMappings(mappings);
      setPreviewOpen(true);
    } catch (error) {
      console.error('Error loading field mappings:', error);
      setSnackbar({
        open: true,
        message: 'Error loading field mappings',
        severity: 'error',
      });
    }
  };

  const handleSaveTestData = async (data: any) => {
    try {
      // Here you would typically save the test data to your backend
      console.log('Test data:', data);
      setSnackbar({
        open: true,
        message: 'Test data saved successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error saving test data:', error);
      setSnackbar({
        open: true,
        message: 'Error saving test data',
        severity: 'error',
      });
    }
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
              <TableCell align="right">Actions</TableCell>
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
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handlePreviewClick(template)}
                      title="Preview"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDownloadTemplate(template.id)}
                      title="Download"
                    >
                      <DownloadIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        setSelectedTemplate(template);
                        setTabValue(1);
                      }}
                      title="Field Mappings"
                    >
                      <SettingsIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleOpenDialog(template)}
                      title="Edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteTemplate(template.id)}
                      title="Delete"
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
          {selectedTemplate ? 'Edit Template' : 'Add Template'}
        </DialogTitle>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  {...register('name')}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  {...register('description')}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.category}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    label="Category"
                    {...register('category')}
                  >
                    <MenuItem value="broker">Broker</MenuItem>
                    <MenuItem value="boclife">BOC Life</MenuItem>
                    <MenuItem value="chubb">Chubb</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Version"
                  {...register('version')}
                  error={!!errors.version}
                  helperText={errors.version?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <input
                  type="file"
                  id="template-file"
                  accept=".pdf"
                  style={{ display: 'none' }}
                />
                <label htmlFor="template-file">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                  >
                    Upload PDF Template
                  </Button>
                </label>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedTemplate ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {selectedTemplate && (
        <Box sx={{ mt: 4 }}>
          <Paper>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="template tabs"
            >
              <Tab label="Details" />
              <Tab label="Field Mappings" />
              <Tab label="Testing" />
            </Tabs>
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6">Template Details</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography><strong>Name:</strong> {selectedTemplate.name}</Typography>
                  <Typography><strong>Category:</strong> {selectedTemplate.category}</Typography>
                  <Typography><strong>Version:</strong> {selectedTemplate.version}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography><strong>Status:</strong> {selectedTemplate.is_active ? 'Active' : 'Inactive'}</Typography>
                  <Typography><strong>Created:</strong> {new Date(selectedTemplate.created_at).toLocaleDateString()}</Typography>
                  <Typography><strong>Last Updated:</strong> {new Date(selectedTemplate.updated_at).toLocaleDateString()}</Typography>
                </Grid>
              </Grid>
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <FieldMappingComponent
                templateId={selectedTemplate.id}
                onMappingUpdate={() => {
                  setSnackbar({
                    open: true,
                    message: 'Field mappings updated successfully',
                    severity: 'success',
                  });
                }}
              />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <FieldValidation
                templateId={selectedTemplate.id}
                fieldMappings={fieldMappings}
                onSaveTestData={handleSaveTestData}
              />
            </TabPanel>
          </Paper>
        </Box>
      )}

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Template Preview</Typography>
            <IconButton onClick={() => setPreviewOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTemplate && (
            <PDFPreview
              templateId={selectedTemplate.id}
              fieldMappings={fieldMappings}
              onSaveTestData={handleSaveTestData}
            />
          )}
        </DialogContent>
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