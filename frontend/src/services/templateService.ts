import { api } from './api';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  file_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateData {
  name: string;
  description: string;
  category: string;
  version: string;
  file: File;
}

export interface UpdateTemplateData {
  name?: string;
  description?: string;
  category?: string;
  version?: string;
  file?: File;
  is_active?: boolean;
}

class TemplateService {
  async getTemplates(): Promise<Template[]> {
    const response = await api.get('/templates/');
    return response.data;
  }

  async getTemplate(id: string): Promise<Template> {
    const response = await api.get(`/templates/${id}/`);
    return response.data;
  }

  async createTemplate(data: CreateTemplateData): Promise<Template> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('version', data.version);
    formData.append('file', data.file);

    const response = await api.post('/templates/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateTemplate(id: string, data: UpdateTemplateData): Promise<Template> {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    if (data.category) formData.append('category', data.category);
    if (data.version) formData.append('version', data.version);
    if (data.file) formData.append('file', data.file);
    if (typeof data.is_active === 'boolean') {
      formData.append('is_active', data.is_active.toString());
    }

    const response = await api.patch(`/templates/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteTemplate(id: string): Promise<void> {
    await api.delete(`/templates/${id}/`);
  }

  async getTemplatePreview(id: string): Promise<string> {
    const response = await api.get(`/templates/${id}/preview/`);
    return response.data.preview_url;
  }

  async downloadTemplate(id: string): Promise<void> {
    const response = await api.get(`/templates/${id}/download/`, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `template-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}

export const templateService = new TemplateService(); 