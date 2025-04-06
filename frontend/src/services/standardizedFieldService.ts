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
}

export interface StandardizedFieldsResponse {
  results: StandardizedField[];
  count: number;
}

class StandardizedFieldService {
  async getFields(page: number = 1, pageSize: number = 10): Promise<StandardizedFieldsResponse> {
    const response = await api.get(`/forms/standardized-fields/?page=${page}&page_size=${pageSize}`);
    return response.data;
  }

  async createField(field: Omit<StandardizedField, 'id'>): Promise<StandardizedField> {
    const response = await api.post('/forms/standardized-fields/', field);
    return response.data;
  }

  async updateField(id: string, field: Partial<StandardizedField>): Promise<StandardizedField> {
    const response = await api.patch(`/forms/standardized-fields/${id}/`, field);
    return response.data;
  }

  async deleteField(id: string): Promise<void> {
    await api.delete(`/forms/standardized-fields/${id}/`);
  }
}

export const standardizedFieldService = new StandardizedFieldService(); 