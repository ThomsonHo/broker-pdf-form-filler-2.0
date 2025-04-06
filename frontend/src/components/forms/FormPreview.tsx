'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { GeneratedForm, pdfFormService } from '@/services/pdfFormService';

interface FormPreviewProps {
  form: GeneratedForm;
  onDownload?: () => void;
}

export const FormPreview: React.FC<FormPreviewProps> = ({ form, onDownload }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (form.download_url) {
      setLoading(false);
    }
  }, [form.download_url]);

  const handleDownload = async () => {
    try {
      const blob = await pdfFormService.downloadForm(form.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${form.template_name}_${new Date().toISOString()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      if (onDownload) {
        onDownload();
      }
    } catch (err) {
      console.error('Error downloading form:', err);
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
    <Paper sx={{ p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          {form.template_name}
        </Typography>
        <Box>
          <Tooltip title="Download">
            <IconButton onClick={handleDownload}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box
        sx={{
          border: '1px solid #e0e0e0',
          borderRadius: 1,
          overflow: 'hidden',
          maxHeight: '70vh',
          overflowY: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 3
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Click the download button to view and save the PDF.
        </Typography>
      </Box>
    </Paper>
  );
}; 