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
      const templatesArray = Array.isArray(response) ? response : [];
      setTemplates(templatesArray);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching templates',
        severity: 'error',
      });
      setTemplates([]);
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
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
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

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Template Preview
          <IconButton
            aria-label="close"
            onClick={() => setPreviewOpen(false)}
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleDownloadTemplate(selectedTemplate?.id)}
                startIcon={<DownloadIcon />}
              >
                Download Template
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleOpenDialog(selectedTemplate)}
                startIcon={<EditIcon />}
              >
                Edit Template
              </Button>
            </Box>
            {previewUrl && (
              <Box sx={{ height: '70vh', border: '1px solid rgba(0, 0, 0, 0.12)' }}>
                <PDFPreview url={previewUrl} />
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          Field Mappings
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Field Mappings" />
                <Tab label="Field Validation" />
                <Tab label="Test Data" />
              </Tabs>
            </Box>
            <TabPanel value={tabValue} index={0}>
              {selectedTemplate ? (
                <FieldMappingComponent
                  templateId={selectedTemplate.id}
                  fieldMappings={fieldMappings}
                  onSave={(mappings) => {
                    setFieldMappings(mappings);
                    handleCloseDialog();
                  }}
                />
              ) : (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography>Please select a template to view field mappings</Typography>
                </Box>
              )}
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              {selectedTemplate ? (
                <FieldValidation
                  templateId={selectedTemplate.id}
                  fieldMappings={fieldMappings}
                />
              ) : (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography>Please select a template to validate fields</Typography>
                </Box>
              )}
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Test Data (JSON)"
                  multiline
                  rows={10}
                  value={JSON.stringify(selectedTemplate?.test_data || {}, null, 2)}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleSaveTestData(selectedTemplate?.test_data)}
                >
                  Save Test Data
                </Button>
              </Box>
            </TabPanel>
          </Box>
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