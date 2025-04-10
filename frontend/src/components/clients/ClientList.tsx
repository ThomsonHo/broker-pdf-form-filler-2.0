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
  TextField,
  Button,
  IconButton,
  Chip,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Tooltip,
  CircularProgress,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { Client, ClientFilters, fetchClients, exportClients, deleteClient, toggleClientActive, getCoreClientFields, getFilterableClientFields, ClientField, getClientFields } from '../../services/clientService';
import ClientForm from './ClientForm';

interface ClientListProps {
  onAddClient: () => void;
}

const ClientList: React.FC<ClientListProps> = ({
  onAddClient,
}) => {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [filters, setFilters] = useState<ClientFilters>({});
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [coreFields, setCoreFields] = useState<ClientField[]>([]);
  const [filterableFields, setFilterableFields] = useState<ClientField[]>([]);
  const [allFields, setAllFields] = useState<ClientField[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const loadFields = React.useCallback(async () => {
    try {
      const [coreFieldsData, filterableFieldsData, allFieldsData] = await Promise.all([
        getCoreClientFields(),
        getFilterableClientFields(),
        getClientFields()
      ]);
      setCoreFields(coreFieldsData);
      setFilterableFields(filterableFieldsData);
      setAllFields(allFieldsData);
    } catch (err) {
      console.error('Error loading fields:', err);
      setError('Failed to load field definitions. Please try again later.');
    }
  }, []);

  const loadClients = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchClients({
        ...filters,
        page: page + 1,
        page_size: rowsPerPage,
        search: searchTerm || undefined,
      });
      setClients(response.results || []);
      setTotalCount(response.count || 0);
    } catch (err) {
      setError('Failed to load clients. Please try again later.');
      console.error('Error loading clients:', err);
      setClients([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [filters, page, rowsPerPage, searchTerm]);

  useEffect(() => {
    loadFields();
  }, [loadFields]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(0);
  };

  const handleFilterChange = (field: keyof ClientFilters) => (
    event: SelectChangeEvent<string>
  ) => {
    setFilters({
      ...filters,
      [field]: event.target.value,
    });
    setPage(0);
  };

  const handleExportClients = async () => {
    try {
      await exportClients({
        search: searchTerm,
        ...filters,
      });
    } catch (err) {
      console.error('Error exporting clients:', err);
    }
  };

  const handleAddClient = () => {
    router.push('/clients/new');
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedClient(null);
  };

  const handleSaveClient = async (client: Client) => {
    handleCloseEditDialog();
    await loadClients();
  };

  const handleDeleteClient = async (clientId: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await deleteClient(clientId);
        await loadClients();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete client. Please try again later.');
        console.error('Error deleting client:', err);
      }
    }
  };

  const handleToggleActive = async (clientId: string, currentStatus: boolean) => {
    try {
      await toggleClientActive(clientId);
      await loadClients();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update client status. Please try again later.');
      console.error('Error updating client status:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
        <Button onClick={loadClients} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2, p: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: 2,
            mb: 2,
            alignItems: 'center',
          }}
        >
          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <Typography variant="h5" component="h2">
              Clients
            </Typography>
          </Box>
          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' }, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportClients}
            >
              Export
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddClient}
            >
              Add Client
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: 2,
            mb: 2,
            alignItems: 'center',
          }}
        >
          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <TextField
              fullWidth
              placeholder="Search clients..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' }, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
          </Box>
        </Box>

        {showFilters && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gap: 2,
              mb: 2,
            }}
          >
            {filterableFields.map((field) => (
              <Box key={field.id} sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
                <FormControl fullWidth>
                  <InputLabel>{field.label}</InputLabel>
                  <Select
                    value={filters[field.name]?.toString() || ''}
                    onChange={handleFilterChange(field.name)}
                    label={field.label}
                  >
                    <MenuItem value="">All</MenuItem>
                    {field.options?.map((option: any) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            ))}
          </Box>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {coreFields.map((field) => (
                  <TableCell key={field.id}>{field.label}</TableCell>
                ))}
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients && clients.length > 0 ? (
                clients.map((client) => (
                  <TableRow key={client.id}>
                    {coreFields.map((field) => (
                      <TableCell key={field.id}>
                        {client.data?.[field.name] || client[field.name] || ''}
                      </TableCell>
                    ))}
                    <TableCell>
                      <Chip
                        label={client.is_active ? 'Active' : 'Inactive'}
                        color={client.is_active ? 'success' : 'default'}
                        onClick={() => handleToggleActive(client.id, client.is_active)}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleEditClient(client)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDeleteClient(client.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={coreFields.length + 2} align="center">
                    No clients found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Client</DialogTitle>
        <DialogContent>
          {selectedClient && (
            <ClientForm
              clientId={selectedClient.id}
              onSave={handleSaveClient}
              onCancel={handleCloseEditDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ClientList; 