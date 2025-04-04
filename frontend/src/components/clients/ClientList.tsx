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
      setClients(response.results);
      setTotalCount(response.count);
    } catch (err) {
      setError('Failed to load clients. Please try again later.');
      console.error('Error loading clients:', err);
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

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2, p: 2 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h5" component="h2">
              Clients
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={onAddClient}
              sx={{ mr: 1 }}
            >
              Add Client
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportClients}
            >
              Export
            </Button>
          </Grid>
        </Grid>

        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <form onSubmit={handleSearchSubmit}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </form>
          </Grid>
          <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </Grid>
        </Grid>

        {showFilters && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.is_active === undefined ? '' : String(filters.is_active)}
                  onChange={handleFilterChange('is_active')}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Nationality</InputLabel>
                <Select
                  value={filters.nationality || ''}
                  onChange={handleFilterChange('nationality')}
                  label="Nationality"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Hong Kong">Hong Kong</MenuItem>
                  <MenuItem value="China">China</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Country</InputLabel>
                <Select
                  value={filters.country || ''}
                  onChange={handleFilterChange('country')}
                  label="Country"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Hong Kong">Hong Kong</MenuItem>
                  <MenuItem value="China">China</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>City</InputLabel>
                <Select
                  value={filters.city || ''}
                  onChange={handleFilterChange('city')}
                  label="City"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Hong Kong">Hong Kong</MenuItem>
                  <MenuItem value="Kowloon">Kowloon</MenuItem>
                  <MenuItem value="New Territories">New Territories</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ p: 2 }}>
            {error}
          </Typography>
        ) : clients.length === 0 ? (
          <Typography sx={{ p: 2, textAlign: 'center' }}>
            No clients found. Try adjusting your filters or add a new client.
          </Typography>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>ID Number</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clients.map((client) => (
                  <TableRow hover key={client.id}>
                    <TableCell component="th" scope="row">
                      {client.full_name}
                    </TableCell>
                    <TableCell>{client.id_number}</TableCell>
                    <TableCell>
                      {client.email && (
                        <Typography variant="body2">{client.email}</Typography>
                      )}
                      {client.phone_number && (
                        <Typography variant="body2">{client.phone_number}</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {client.city}, {client.country}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={client.is_active ? 'Active' : 'Inactive'}
                        color={client.is_active ? 'success' : 'default'}
                        size="small"
                        onClick={() => handleToggleActive(client.id, client.is_active)}
                        sx={{ cursor: 'pointer' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View">
                        <IconButton
                          size="small"
                          onClick={() => handleViewClient(client)}
                          color="primary"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEditClient(client)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClient(client.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default ClientList; 