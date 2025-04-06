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
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Tooltip,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { Client, ClientFilters, fetchClients, exportClients, deleteClient, toggleClientActive } from '../../services/clientService';

interface ClientListProps {
  onAddClient: () => void;
  onEditClient: (clientId: string) => void;
  onViewClient: (clientId: string) => void;
}

const ClientList: React.FC<ClientListProps> = ({
  onAddClient,
  onEditClient,
  onViewClient,
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

  // Fetch clients when filters, page, or rowsPerPage change
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
    onEditClient(client.id);
  };

  const handleViewClient = (client: Client) => {
    onViewClient(client.id);
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
          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' }, display: 'flex', justifyContent: 'flex-end' }}>
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
            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.is_active?.toString() || ''}
                  onChange={handleFilterChange('is_active')}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
              <FormControl fullWidth>
                <InputLabel>Nationality</InputLabel>
                <Select
                  value={filters.nationality || ''}
                  onChange={handleFilterChange('nationality')}
                  label="Nationality"
                >
                  <MenuItem value="">All</MenuItem>
                  {/* Add nationality options here */}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
              <FormControl fullWidth>
                <InputLabel>Country</InputLabel>
                <Select
                  value={filters.country || ''}
                  onChange={handleFilterChange('country')}
                  label="Country"
                >
                  <MenuItem value="">All</MenuItem>
                  {/* Add country options here */}
                </Select>
              </FormControl>
            </Box>
          </Box>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients && clients.length > 0 ? (
                clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>{client.full_name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone_number}</TableCell>
                    <TableCell>
                      <Chip
                        label={client.is_active ? 'Active' : 'Inactive'}
                        color={client.is_active ? 'success' : 'default'}
                        onClick={() => handleToggleActive(client.id, client.is_active)}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View">
                        <IconButton onClick={() => handleViewClient(client)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
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
                  <TableCell colSpan={5} align="center">
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
    </Box>
  );
};

export default ClientList; 