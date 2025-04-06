import { api } from './api';

export interface StandardizedField {
  id: string;
  name: string;
  description: string;
  field_type: string;
  validation_rules: string[];
  is_required: boolean;
  field_definition: string;
  llm_guide: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateStandardizedFieldData {
  name: string;
  description: string;
  field_type: string;
  validation_rules: string[];
  is_required: boolean;
  field_definition: string;
  llm_guide: string;
  metadata: Record<string, any>;
}

export interface UpdateStandardizedFieldData extends Partial<CreateStandardizedFieldData> {
  id: string;
}

class StandardizedFieldService {
  async getStandardizedFields(): Promise<StandardizedField[]> {
    const response = await api.get('/standardized-fields/');
    return response.data;
  }

  async getStandardizedField(id: string): Promise<StandardizedField> {
    const response = await api.get(`/standardized-fields/${id}/`);
    return response.data;
  }

  async createStandardizedField(data: CreateStandardizedFieldData): Promise<StandardizedField> {
    const response = await api.post('/standardized-fields/', data);
    return response.data;
  }

  async updateStandardizedField(id: string, data: UpdateStandardizedFieldData): Promise<StandardizedField> {
    const response = await api.put(`/standardized-fields/${id}/`, data);
    return response.data;
  }

  async deleteStandardizedField(id: string): Promise<void> {
    await api.delete(`/standardized-fields/${id}/`);
  }

  async generateFieldDefinition(fieldName: string, fieldType: string): Promise<string> {
    const response = await api.post('/standardized-fields/generate-definition/', {
      field_name: fieldName,
      field_type: fieldType,
    });
    return response.data.field_definition;
  }

  async generateLLMGuide(fieldName: string, fieldType: string, fieldDefinition: string): Promise<string> {
    const response = await api.post('/standardized-fields/generate-llm-guide/', {
      field_name: fieldName,
      field_type: fieldType,
      field_definition: fieldDefinition,
    });
    return response.data.llm_guide;
  }

  async suggestValidationRules(fieldName: string, fieldType: string): Promise<string[]> {
    const response = await api.post('/standardized-fields/suggest-validation-rules/', {
      field_name: fieldName,
      field_type: fieldType,
    });
    return response.data.validation_rules;
  }
}

export const standardizedFieldService = new StandardizedFieldService(); 