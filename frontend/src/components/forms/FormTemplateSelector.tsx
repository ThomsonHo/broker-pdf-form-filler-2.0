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
  Alert,
  Checkbox,
  Button,
  TextField,
  InputAdornment,
} from '@mui/material';
import { FormTemplate, pdfFormService } from '@/services/pdfFormService';
import SearchIcon from '@mui/icons-material/Search';

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
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSubmit = () => {
    // Implementation of handleSubmit
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: 2,
          }}
        >
          <Box sx={{ gridColumn: 'span 12' }}>
            <TextField
              fullWidth
              placeholder="Search templates..."
              value={searchQuery}
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
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 2,
            mt: 2,
          }}
        >
          {filteredTemplates.map((template) => {
            const isSelected = selectedTemplates.some(t => t.id === template.id);
            return (
              <Box key={template.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    height: '100%',
                    bgcolor: isSelected ? 'action.selected' : undefined,
                  }}
                  onClick={() => handleTemplateClick(template)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {template.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {template.description}
                        </Typography>
                      </Box>
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTemplateClick(template);
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            );
          })}
        </Box>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={selectedTemplates.length === 0}
          >
            Generate Forms ({selectedTemplates.length})
          </Button>
        </Box>
      </Box>
    </Box>
  );
}; 