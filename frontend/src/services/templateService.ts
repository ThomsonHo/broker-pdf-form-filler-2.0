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

export interface FieldMapping {
  id: string;
  template_id: string;
  pdf_field_name: string;
  system_field_name: string;
  field_type: string;
  transformation_rule?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFieldMappingData {
  pdf_field_name: string;
  system_field_name: string;
  field_type: string;
  transformation_rule?: string;
}

export interface UpdateFieldMappingData {
  pdf_field_name?: string;
  system_field_name?: string;
  field_type?: string;
  transformation_rule?: string;
}

export class TemplateService {
  async getTemplates(): Promise<Template[]> {
    const response = await api.get('/forms/templates/');
    return response.data;
  }

  async getTemplate(id: string): Promise<Template> {
    const response = await api.get(`/forms/templates/${id}/`);
    return response.data;
  }

  async createTemplate(data: CreateTemplateData): Promise<Template> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('version', data.version);
    formData.append('file', data.file);

    const response = await api.post('/forms/templates/', formData, {
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

    const response = await api.patch(`/forms/templates/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteTemplate(id: string): Promise<void> {
    await api.delete(`/forms/templates/${id}/`);
  }

  async getTemplatePreview(templateId: string): Promise<string> {
    const response = await api.get(`/forms/templates/${templateId}/preview`);
    return response.data.previewUrl;
  }

  async downloadTemplate(id: string): Promise<void> {
    const response = await api.get(`/forms/templates/${id}/download`, {
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

  // Field Mapping Methods
  async getFieldMappings(templateId: string): Promise<FieldMapping[]> {
    const response = await api.get(`/forms/templates/${templateId}/field-mappings`);
    return response.data;
  }

  async getFieldMapping(templateId: string, mappingId: string): Promise<FieldMapping> {
    const response = await api.get(`/forms/templates/${templateId}/field-mappings/${mappingId}`);
    return response.data;
  }

  async createFieldMapping(templateId: string, data: CreateFieldMappingData): Promise<FieldMapping> {
    const response = await api.post(`/forms/templates/${templateId}/field-mappings`, data);
    return response.data;
  }

  async updateFieldMapping(templateId: string, mappingId: string, data: UpdateFieldMappingData): Promise<FieldMapping> {
    const response = await api.patch(`/forms/templates/${templateId}/field-mappings/${mappingId}`, data);
    return response.data;
  }

  async deleteFieldMapping(templateId: string, mappingId: string): Promise<void> {
    await api.delete(`/forms/templates/${templateId}/field-mappings/${mappingId}`);
  }

  async validateFieldMappings(templateId: string): Promise<{ valid: boolean; errors: string[] }> {
    const response = await api.post(`/forms/templates/${templateId}/validate-mappings`);
    return response.data;
  }
}

export const templateService = new TemplateService();