import { api } from './api';

export interface ValidationRule {
  type: string;
  message: string;
  value?: any;
}

export interface RelationshipRule {
  type: string;
  targetField: string;
  condition?: {
    field: string;
    operator: string;
    value: any;
  };
}

export interface StandardizedField {
  id: string;
  name: string;
  label: string;
  llm_guide?: string | null;
  is_required?: boolean;
  field_category: string;
  display_category: string;
  field_type: string;
  field_definition?: string | null;
  has_validation?: boolean;
  validation_rules?: ValidationRule[];
  has_relationship?: boolean;
  relationship_rules?: RelationshipRule[];
  options?: Record<string, any> | null;
  default_value?: string | null;
  placeholder?: string | null;
  help_text?: string | null;
  is_active?: boolean;
  is_system?: boolean;
  metadata?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface StandardizedFieldCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateStandardizedFieldData {
  name: string;
  label: string;
  llm_guide?: string | null;
  is_required?: boolean;
  field_category: string;
  display_category: string;
  field_type: string;
  field_definition?: string | null;
  has_validation?: boolean;
  validation_rules?: ValidationRule[];
  has_relationship?: boolean;
  relationship_rules?: RelationshipRule[];
  options?: Record<string, any> | null;
  default_value?: string | null;
  placeholder?: string | null;
  help_text?: string | null;
  is_active?: boolean;
  is_system?: boolean;
  metadata?: Record<string, any> | null;
}

export interface UpdateStandardizedFieldData extends Partial<CreateStandardizedFieldData> {}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface PaginationParams {
  page?: number;
  page_size?: number;
}

export interface IStandardizedFieldService {
  getStandardizedFields(params?: PaginationParams): Promise<PaginatedResponse<StandardizedField>>;
  getStandardizedFieldCategories(params?: PaginationParams): Promise<PaginatedResponse<StandardizedFieldCategory>>;
  createStandardizedField(data: CreateStandardizedFieldData): Promise<StandardizedField>;
  updateStandardizedField(id: string, data: UpdateStandardizedFieldData): Promise<StandardizedField>;
  deleteStandardizedField(id: string): Promise<void>;
  createStandardizedFieldCategory(data: { name: string; description?: string }): Promise<StandardizedFieldCategory>;
  updateStandardizedFieldCategory(id: string, data: { name: string; description?: string }): Promise<StandardizedFieldCategory>;
  deleteStandardizedFieldCategory(id: string): Promise<void>;
}

export class StandardizedFieldService implements IStandardizedFieldService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'forms/';
  }

  // Standardized Field methods
  async getStandardizedFields(params?: PaginationParams): Promise<PaginatedResponse<StandardizedField>> {
    const response = await api.get(`${this.baseUrl}standardized-fields/`, { params });
    return response.data;
  }

  async createStandardizedField(data: CreateStandardizedFieldData): Promise<StandardizedField> {
    const response = await api.post(`${this.baseUrl}standardized-fields/`, data);
    return response.data;
  }

  async updateStandardizedField(id: string, data: UpdateStandardizedFieldData): Promise<StandardizedField> {
    const response = await api.put(`${this.baseUrl}standardized-fields/${id}/`, data);
    return response.data;
  }

  async deleteStandardizedField(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}standardized-fields/${id}/`);
  }

  // Standardized Field Category methods
  async getStandardizedFieldCategories(params?: PaginationParams): Promise<PaginatedResponse<StandardizedFieldCategory>> {
    const response = await api.get(`${this.baseUrl}standardized-field-categories/`, { params });
    return response.data;
  }

  async createStandardizedFieldCategory(data: { name: string; description?: string }): Promise<StandardizedFieldCategory> {
    const response = await api.post(`${this.baseUrl}standardized-field-categories/`, data);
    return response.data;
  }

  async updateStandardizedFieldCategory(id: string, data: { name: string; description?: string }): Promise<StandardizedFieldCategory> {
    const response = await api.put(`${this.baseUrl}standardized-field-categories/${id}/`, data);
    return response.data;
  }

  async deleteStandardizedFieldCategory(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}standardized-field-categories/${id}/`);
  }
}

export const standardizedFieldService = new StandardizedFieldService(); 