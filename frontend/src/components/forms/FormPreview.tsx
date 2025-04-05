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
import { Document, Page, pdfjs } from 'react-pdf';
import { GeneratedForm, pdfFormService } from '@/services/pdfFormService';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface FormPreviewProps {
  form: GeneratedForm;
  onDownload?: () => void;
}

export const FormPreview: React.FC<FormPreviewProps> = ({ form, onDownload }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (form.download_url) {
      setLoading(false);
    }
  }, [form.download_url]);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const handleDocumentLoadError = (error: Error) => {
    setError('Failed to load PDF document');
    setLoading(false);
    console.error('Error loading PDF:', error);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

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
          <Tooltip title="Zoom Out">
            <IconButton onClick={handleZoomOut} disabled={scale <= 0.5}>
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom In">
            <IconButton onClick={handleZoomIn} disabled={scale >= 2.0}>
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
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
          overflowY: 'auto'
        }}
      >
        <Document
          file={form.download_url}
          onLoadSuccess={handleDocumentLoadSuccess}
          onLoadError={handleDocumentLoadError}
          loading={
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          }
        >
          {Array.from(new Array(numPages), (el, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          ))}
        </Document>
      </Box>

      {numPages && (
        <Typography variant="body2" color="text.secondary" align="center" mt={1}>
          Page {pageNumber} of {numPages}
        </Typography>
      )}
    </Paper>
  );
}; 