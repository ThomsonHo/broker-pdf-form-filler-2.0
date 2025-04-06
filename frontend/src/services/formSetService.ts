import { api } from './api';
import { Template } from './templateService';

export interface FormSet {
  id: string;
  name: string;
  description: string;
  templates: Template[];
  created_at: string;
  updated_at: string;
}

export interface CreateFormSetData {
  name: string;
  description: string;
  template_ids: string[];
}

export interface UpdateFormSetData extends Partial<CreateFormSetData> {
  id: string;
}

class FormSetService {
  async getFormSets(): Promise<FormSet[]> {
    const response = await api.get('/form-sets/');
    return response.data;
  }

  async getFormSet(id: string): Promise<FormSet> {
    const response = await api.get(`/form-sets/${id}/`);
    return response.data;
  }

  async createFormSet(data: CreateFormSetData): Promise<FormSet> {
    const response = await api.post('/form-sets/', data);
    return response.data;
  }

  async updateFormSet(id: string, data: UpdateFormSetData): Promise<FormSet> {
    const response = await api.put(`/form-sets/${id}/`, data);
    return response.data;
  }

  async deleteFormSet(id: string): Promise<void> {
    await api.delete(`/form-sets/${id}/`);
  }
}

export const formSetService = new FormSetService(); 