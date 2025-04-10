'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  SelectChangeEvent,
} from '@mui/material';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowUpward, ArrowDownward, DragIndicator } from '@mui/icons-material';
import { standardizedFieldService, StandardizedField, StandardizedFieldCategory } from '@/services/standardizedFieldService';

interface SortableItemProps {
  id: string;
  field: StandardizedField;
  index: number;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  isLast: boolean;
  isFirst: boolean;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, field, index, onMoveUp, onMoveDown, isFirst, isLast }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      secondaryAction={
        <Box>
          <IconButton edge="end" disabled={isFirst} onClick={() => onMoveUp(index)}>
            <ArrowUpward />
          </IconButton>
          <IconButton edge="end" disabled={isLast} onClick={() => onMoveDown(index)}>
            <ArrowDownward />
          </IconButton>
          <IconButton edge="end" {...attributes} {...listeners}>
            <DragIndicator />
          </IconButton>
        </Box>
      }
    >
      <ListItemText
        primary={field.label}
        secondary={`${field.field_type} | Display Order: ${field.display_order || 'Not set'}`}
      />
    </ListItem>
  );
};

interface DisplayOrderManagerProps {
  onOrderUpdated?: () => void;
}

const DisplayOrderManager: React.FC<DisplayOrderManagerProps> = ({ onOrderUpdated }) => {
  const [categories, setCategories] = useState<StandardizedFieldCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [fields, setFields] = useState<StandardizedField[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadFieldsByCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await standardizedFieldService.getStandardizedFieldCategories();
      setCategories(categoriesData.results);
      if (categoriesData.results.length > 0) {
        setSelectedCategory(categoriesData.results[0].name);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to load categories',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFieldsByCategory = async (category: string) => {
    try {
      setLoading(true);
      const fieldsData = await standardizedFieldService.getStandardizedFieldsByCategory(category);
      // Sort by display_order if available, otherwise fall back to name
      const sortedFields = [...fieldsData].sort((a, b) => {
        if (a.display_order !== undefined && b.display_order !== undefined) {
          return a.display_order - b.display_order;
        }
        return a.name.localeCompare(b.name);
      });
      setFields(sortedFields);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to load fields',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSelectedCategory(event.target.value);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);
      
      const newFields = [...fields];
      const [movedItem] = newFields.splice(oldIndex, 1);
      newFields.splice(newIndex, 0, movedItem);
      
      // Update display order for all affected fields
      const updatedFields = newFields.map((field, index) => ({
        ...field,
        display_order: index + 1,
      }));
      
      setFields(updatedFields);
      
      // Save the updated display order to the backend
      try {
        await Promise.all(
          updatedFields.map((field) =>
            standardizedFieldService.updateStandardizedFieldDisplayOrder(field.id, field.display_order || 0)
          )
        );
        
        setSnackbar({
          open: true,
          message: 'Display order updated successfully',
          severity: 'success',
        });
        
        if (onOrderUpdated) {
          onOrderUpdated();
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: error instanceof Error ? error.message : 'Failed to update display order',
          severity: 'error',
        });
        // Revert changes on error
        loadFieldsByCategory(selectedCategory);
      }
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index > 0) {
      const newFields = [...fields];
      [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
      
      // Update display order
      const updatedFields = newFields.map((field, idx) => ({
        ...field,
        display_order: idx + 1,
      }));
      
      setFields(updatedFields);
      
      // Save the changes
      try {
        await Promise.all([
          standardizedFieldService.updateStandardizedFieldDisplayOrder(
            updatedFields[index - 1].id,
            updatedFields[index - 1].display_order || 0
          ),
          standardizedFieldService.updateStandardizedFieldDisplayOrder(
            updatedFields[index].id,
            updatedFields[index].display_order || 0
          ),
        ]);
        
        setSnackbar({
          open: true,
          message: 'Field moved up successfully',
          severity: 'success',
        });
        
        if (onOrderUpdated) {
          onOrderUpdated();
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: error instanceof Error ? error.message : 'Failed to move field',
          severity: 'error',
        });
        // Revert changes on error
        loadFieldsByCategory(selectedCategory);
      }
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index < fields.length - 1) {
      const newFields = [...fields];
      [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
      
      // Update display order
      const updatedFields = newFields.map((field, idx) => ({
        ...field,
        display_order: idx + 1,
      }));
      
      setFields(updatedFields);
      
      // Save the changes
      try {
        await Promise.all([
          standardizedFieldService.updateStandardizedFieldDisplayOrder(
            updatedFields[index].id,
            updatedFields[index].display_order || 0
          ),
          standardizedFieldService.updateStandardizedFieldDisplayOrder(
            updatedFields[index + 1].id,
            updatedFields[index + 1].display_order || 0
          ),
        ]);
        
        setSnackbar({
          open: true,
          message: 'Field moved down successfully',
          severity: 'success',
        });
        
        if (onOrderUpdated) {
          onOrderUpdated();
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: error instanceof Error ? error.message : 'Failed to move field',
          severity: 'error',
        });
        // Revert changes on error
        loadFieldsByCategory(selectedCategory);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Manage Field Display Order
        </Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="category-select-label">Category</InputLabel>
          <Select
            labelId="category-select-label"
            value={selectedCategory}
            label="Category"
            onChange={handleCategoryChange}
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.name}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : fields.length === 0 ? (
          <Typography align="center">No fields found in this category</Typography>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={fields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
              <List component={Paper} variant="outlined">
                {fields.map((field, index) => (
                  <React.Fragment key={field.id}>
                    {index > 0 && <Divider />}
                    <SortableItem
                      id={field.id}
                      field={field}
                      index={index}
                      onMoveUp={handleMoveUp}
                      onMoveDown={handleMoveDown}
                      isFirst={index === 0}
                      isLast={index === fields.length - 1}
                    />
                  </React.Fragment>
                ))}
              </List>
            </SortableContext>
          </DndContext>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DisplayOrderManager; 