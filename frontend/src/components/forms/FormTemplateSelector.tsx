'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { FormTemplate, pdfFormService } from '@/services/pdfFormService';

interface FormTemplateSelectorProps {
  onTemplatesSelected: (templates: FormTemplate[]) => void;
  selectedTemplates: FormTemplate[];
}

export const FormTemplateSelector: React.FC<FormTemplateSelectorProps> = ({
  onTemplatesSelected,
  selectedTemplates
}) => {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    loadTemplates();
  }, [selectedCategory]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pdfFormService.getTemplates(selectedCategory);
      setTemplates(data);
    } catch (err) {
      setError('Failed to load form templates');
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateClick = (template: FormTemplate) => {
    const isSelected = selectedTemplates.some(t => t.id === template.id);
    let newSelection: FormTemplate[];

    if (isSelected) {
      newSelection = selectedTemplates.filter(t => t.id !== template.id);
    } else {
      newSelection = [...selectedTemplates, template];
    }

    onTemplatesSelected(newSelection);
  };

  const categories = Array.from(new Set(templates.map(t => t.category)));

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
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          label="Category"
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map((category) => (
            <MenuItem key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Grid container spacing={2}>
        {templates.map((template) => {
          const isSelected = selectedTemplates.some(t => t.id === template.id);
          return (
            <Grid item xs={12} sm={6} md={4} key={template.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  '&:hover': {
                    borderColor: '#1976d2',
                    boxShadow: 3
                  }
                }}
                onClick={() => handleTemplateClick(template)}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {template.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {template.description}
                  </Typography>
                  <Box mt={1}>
                    <Chip
                      label={template.category}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}; 