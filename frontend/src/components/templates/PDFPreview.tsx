'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { FieldMapping } from '@/services/templateService';

interface PDFPreviewProps {
  url: string;
  templateId?: string;
  fieldMappings?: any[];
  onSaveTestData?: (data: any) => void;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({ url, templateId, fieldMappings, onSaveTestData }) => {
  const [testData, setTestData] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const handleTestDataChange = (fieldName: string, value: string) => {
    setTestData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSaveTestData = () => {
    if (onSaveTestData) {
      onSaveTestData(testData);
      setSnackbar({
        open: true,
        message: 'Test data saved successfully',
        severity: 'success',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <iframe
        src={url}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="PDF Preview"
      />
    </Box>
  );
}; 