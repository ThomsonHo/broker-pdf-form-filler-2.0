import { api } from './api';

export interface StandardizedField {
  id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  validation?: {
    type?: string;
    message?: string;
    value?: any;
  };
  relationships?: {
    type?: string;
    targetField?: string;
    condition?: {
      field?: string;
      operator?: string;
      value?: any;
    };
  };
  field_type: string;
  field_category: string;
  validation_rules: string;
  is_required: boolean;
  field_definition: string;
  llm_guide: string;
  category?: {
    id: string;
    name: string;
  };
  metadata: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface StandardizedFieldCategory {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface StandardizedFieldsResponse {
  results: StandardizedField[];
  count: number;
}

export interface CreateStandardizedFieldData {
  name: string;
  description?: string;
  field_type: string;
  field_category: string;
  validation_rules?: string;
  is_required?: boolean;
  field_definition: string;
  llm_guide?: string;
  category?: string;
  metadata?: Record<string, any>;
}

export interface UpdateStandardizedFieldData {
  name?: string;
  description?: string;
  field_type?: string;
  field_category?: string;
  validation_rules?: string;
  is_required?: boolean;
  field_definition?: string;
  llm_guide?: string;
  category?: string;
  metadata?: Record<string, any>;
}

class StandardizedFieldService {
  async getStandardizedFields(): Promise<StandardizedField[]> {
    const response = await api.get('/forms/standardized-fields/');
    return response.data.results || [];
  }

  async createStandardizedField(field: CreateStandardizedFieldData): Promise<StandardizedField> {
    const response = await api.post('/forms/standardized-fields/', field);
    return response.data;
  }

  async updateStandardizedField(id: string, field: UpdateStandardizedFieldData): Promise<StandardizedField> {
    const response = await api.patch(`/forms/standardized-fields/${id}/`, field);
    return response.data;
  }

  async deleteStandardizedField(id: string): Promise<void> {
    await api.delete(`/forms/standardized-fields/${id}/`);
  }

  async generateFieldDefinition(name: string, fieldType: string): Promise<string> {
    const response = await api.post('/forms/standardized-fields/generate_definition/', {
      name,
      field_type: fieldType,
    });
    return response.data.definition;
  }

  async generateLLMGuide(name: string, fieldType: string, fieldDefinition: string): Promise<string> {
    const response = await api.post('/forms/standardized-fields/generate_llm_guide/', {
      name,
      field_type: fieldType,
      field_definition: fieldDefinition,
    });
    return response.data.guide;
  }

  async suggestValidationRules(name: string, fieldType: string): Promise<string> {
    const response = await api.post('/forms/standardized-fields/suggest_validation_rules/', {
      name,
      field_type: fieldType,
    });
    return JSON.stringify(response.data.rules);
  }

  // Standardized Field Category methods
  async getStandardizedFieldCategories(): Promise<StandardizedFieldCategory[]> {
    const response = await api.get('/forms/standardized-field-categories/');
    return response.data.results || [];
  }

  async createStandardizedFieldCategory(category: { name: string; description?: string }): Promise<StandardizedFieldCategory> {
    const response = await api.post('/forms/standardized-field-categories/', category);
    return response.data;
  }

  async updateStandardizedFieldCategory(id: string, category: { name?: string; description?: string }): Promise<StandardizedFieldCategory> {
    const response = await api.patch(`/forms/standardized-field-categories/${id}/`, category);
    return response.data;
  }

  async deleteStandardizedFieldCategory(id: string): Promise<void> {
    await api.delete(`/forms/standardized-field-categories/${id}/`);
  }
}

export const standardizedFieldService = new StandardizedFieldService(); 