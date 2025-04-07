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
  TablePagination,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { standardizedFieldService, StandardizedFieldCategory } from '../../services/standardizedFieldService';

export default function StandardizedFieldCategoryManagement() {
  const [categories, setCategories] = useState<StandardizedFieldCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<StandardizedFieldCategory | null>(null);
  const [formData, setFormData] = useState<Partial<StandardizedFieldCategory>>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
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
    fetchCategories();
  }, [page, rowsPerPage]);

  const fetchCategories = async () => {
    try {
      const response = await standardizedFieldService.getStandardizedFieldCategories({
        page: page + 1,
        page_size: rowsPerPage
      });
      setCategories(response.results);
      setTotalCount(response.count);
    } catch (error) {
      console.error('Error fetching standardized field categories:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching standardized field categories',
        severity: 'error',
      });
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (category?: StandardizedFieldCategory) => {
    if (category) {
      setSelectedCategory(category);
      setFormData(category);
    } else {
      setSelectedCategory(null);
      setFormData({});
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCategory(null);
    setFormData({});
  };

  const handleSubmit = async () => {
    try {
      if (selectedCategory) {
        await standardizedFieldService.updateStandardizedFieldCategory(selectedCategory.id, formData);
        setSnackbar({
          open: true,
          message: 'Standardized field category updated successfully',
          severity: 'success',
        });
      } else {
        await standardizedFieldService.createStandardizedFieldCategory(formData as { name: string; description?: string });
        setSnackbar({
          open: true,
          message: 'Standardized field category created successfully',
          severity: 'success',
        });
      }
      handleCloseDialog();
      fetchCategories();
    } catch (error) {
      console.error('Error saving standardized field category:', error);
      setSnackbar({
        open: true,
        message: 'Error saving standardized field category',
        severity: 'error',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this standardized field category?')) {
      try {
        await standardizedFieldService.deleteStandardizedFieldCategory(id);
        setSnackbar({
          open: true,
          message: 'Standardized field category deleted successfully',
          severity: 'success',
        });
        fetchCategories();
      } catch (error) {
        console.error('Error deleting standardized field category:', error);
        setSnackbar({
          open: true,
          message: 'Error deleting standardized field category',
          severity: 'error',
        });
      }
    }
  };

  const handleChange = (field: keyof StandardizedFieldCategory) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev: { open: boolean; message: string; severity: 'success' | 'error' }) => ({ ...prev, open: false }));
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Standardized Field Categories</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Category
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Updated At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>{new Date(category.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(category.updated_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(category)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(category.id)}
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
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedCategory ? 'Edit Standardized Field Category' : 'Add Standardized Field Category'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, pt: 2 }}>
            <TextField
              label="Category Name"
              value={formData.name || ''}
              onChange={handleChange('name')}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formData.description || ''}
              onChange={handleChange('description')}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedCategory ? 'Update' : 'Create'}
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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 