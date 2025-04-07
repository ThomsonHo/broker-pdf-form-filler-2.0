import { api } from './api';
import { StandardizedField, StandardizedFieldCategory, CreateStandardizedFieldData, UpdateStandardizedFieldData } from '../types/standardizedField';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export interface ValidationRule {
  type: string;
  value: string;
  message: string;
}

export interface RelationshipRule {
  type: string;
  target_field: string;
  condition: Record<string, any>;
}

export interface StandardizedFieldsResponse {
  results: StandardizedField[];
  count: number;
}

export interface IStandardizedFieldService {
  getFields(): Promise<StandardizedField[]>;
  getField(id: string): Promise<StandardizedField>;
  createField(data: CreateStandardizedFieldData): Promise<StandardizedField>;
  updateField(id: string, data: UpdateStandardizedFieldData): Promise<StandardizedField>;
  deleteField(id: string): Promise<void>;
  getStandardizedFieldCategories(): Promise<StandardizedFieldCategory[]>;
}

export class StandardizedFieldService implements IStandardizedFieldService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_URL}/forms/`;
  }

  async getFields(): Promise<StandardizedField[]> {
    const response = await api.get(`${this.baseUrl}standardized-fields/`);
    return response.data.results;
  }

  async getField(id: string): Promise<StandardizedField> {
    const response = await api.get(`${this.baseUrl}standardized-fields/${id}/`);
    return response.data;
  }

  async createField(data: CreateStandardizedFieldData): Promise<StandardizedField> {
    const response = await api.post(`${this.baseUrl}standardized-fields/`, data);
    return response.data;
  }

  async updateField(id: string, data: UpdateStandardizedFieldData): Promise<StandardizedField> {
    const response = await api.put(`${this.baseUrl}standardized-fields/${id}/`, data);
    return response.data;
  }

  async deleteField(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}standardized-fields/${id}/`);
  }

  async generateFieldDefinition(name: string, fieldType: string): Promise<string> {
    const response = await api.post(`${this.baseUrl}standardized-fields/generate_definition/`, {
      name,
      field_type: fieldType,
    });
    return response.data.definition;
  }

  async generateLLMGuide(name: string, fieldType: string, fieldDefinition: string): Promise<string> {
    const response = await api.post(`${this.baseUrl}standardized-fields/generate_llm_guide/`, {
      name,
      field_type: fieldType,
      field_definition: fieldDefinition,
    });
    return response.data.guide;
  }

  async suggestValidationRules(name: string, fieldType: string): Promise<string> {
    const response = await api.post(`${this.baseUrl}standardized-fields/suggest_validation_rules/`, {
      name,
      field_type: fieldType,
    });
    return JSON.stringify(response.data.rules);
  }

  // Standardized Field Category methods
  async getStandardizedFieldCategories(): Promise<StandardizedFieldCategory[]> {
    const response = await api.get(`${this.baseUrl}standardized-field-categories/`);
    return response.data.results;
  }

  async createStandardizedFieldCategory(category: { name: string; description?: string }): Promise<StandardizedFieldCategory> {
    const response = await api.post(`${this.baseUrl}standardized-field-categories/`, category);
    return response.data;
  }

  async updateStandardizedFieldCategory(id: string, category: { name?: string; description?: string }): Promise<StandardizedFieldCategory> {
    const response = await api.patch(`${this.baseUrl}standardized-field-categories/${id}/`, category);
    return response.data;
  }

  async deleteStandardizedFieldCategory(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}standardized-field-categories/${id}/`);
  }
}

export const standardizedFieldService = new StandardizedFieldService(); 