'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { FormGenerationBatch, pdfFormService } from '@/services/pdfFormService';
import { FormPreview } from './FormPreview';

export const FormBatchList: React.FC = () => {
  const [batches, setBatches] = useState<FormGenerationBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<FormGenerationBatch | null>(null);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pdfFormService.getBatches();
      setBatches(data);
    } catch (err) {
      setError('Failed to load form batches');
      console.error('Error loading batches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBatch = async (batch: FormGenerationBatch) => {
    try {
      const blob = await pdfFormService.downloadBatch(batch.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `forms_batch_${batch.id}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading batch:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'info';
      case 'partial':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {selectedBatch ? (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Batch Details
            </Typography>
            <IconButton onClick={() => setSelectedBatch(null)}>
              <VisibilityIcon />
            </IconButton>
          </Box>
          {selectedBatch.forms.map((form) => (
            <Box key={form.id} mb={3}>
              <FormPreview form={form} />
            </Box>
          ))}
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Insurer</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Forms</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {batches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell>
                    {new Date(batch.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{batch.client?.name}</TableCell>
                  <TableCell>{batch.insurer}</TableCell>
                  <TableCell>
                    <Chip
                      label={batch.status}
                      color={getStatusColor(batch.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {batch.completed_forms} / {batch.total_forms}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Forms">
                      <IconButton
                        onClick={() => setSelectedBatch(batch)}
                        size="small"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download Batch">
                      <IconButton
                        onClick={() => handleDownloadBatch(batch)}
                        size="small"
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}; 