import { api } from './api';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  is_active: boolean;
  file_name?: string;
  form_type?: string;
  form_affiliation?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateData {
  name: string;
  description: string;
  category: string;
  version: string;
  template_file: File;
  form_type?: string;
  form_affiliation?: string;
  is_active?: boolean;
}

export interface UpdateTemplateData {
  name?: string;
  description?: string;
  category?: string;
  version?: string;
  file?: File;
  is_active?: boolean;
  form_type?: string;
  form_affiliation?: string;
}

export interface FieldMapping {
  id: string;
  template_id: string;
  pdf_field_name: string;
  system_field_name?: string | null;
  standardized_field_id?: string | null;
  standardized_field?: {
    id: string;
    name: string;
    label: string;
    field_type: string;
    field_category: string;
    display_category: string;
    created_at: string;
    updated_at: string;
    created_by: string | null;
    updated_by: string | null;
  } | null;
  transformation_rules?: string;
  validation_rules?: string;
  field_definition_override?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFieldMappingData {
  pdf_field_name: string;
  system_field_name?: string;
  standardized_field_id?: string;
  transformation_rules?: string;
  validation_rules?: string;
  field_definition_override?: string;
}

export interface UpdateFieldMappingData {
  pdf_field_name?: string;
  system_field_name?: string;
  field_type?: string;
  transformation_rules?: string;
  validation_rules?: string;
  field_definition_override?: string;
}

export class TemplateService {
  async getTemplates(): Promise<{ count: number; next: string | null; previous: string | null; results: Template[] }> {
    const response = await api.get('/forms/templates/');
    return response.data;
  }

  async getTemplate(id: string): Promise<Template> {
    const response = await api.get(`/forms/templates/${id}/`);
    return response.data;
  }

  async createTemplate(data: CreateTemplateData | FormData): Promise<Template> {
    let formData: FormData;
    
    if (data instanceof FormData) {
      formData = data;
    } else {
      formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('version', data.version);
      formData.append('form_type', data.form_type || 'application');
      formData.append('form_affiliation', data.form_affiliation || 'broker');
      formData.append('is_active', data.is_active?.toString() || 'true');
      formData.append('template_file', data.template_file);
      formData.append('file_name', data.template_file.name);
    }
    
    const response = await api.post('/forms/templates/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateTemplate(id: string, data: UpdateTemplateData | FormData): Promise<Template> {
    let formData: FormData;
    
    if (data instanceof FormData) {
      formData = data;
    } else {
      formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.description) formData.append('description', data.description);
      if (data.category) formData.append('category', data.category);
      if (data.version) formData.append('version', data.version);
      if (data.file) formData.append('file', data.file);
      if (typeof data.is_active === 'boolean') {
        formData.append('is_active', data.is_active.toString());
      }
      if (data.form_type) formData.append('form_type', data.form_type);
      if (data.form_affiliation) formData.append('form_affiliation', data.form_affiliation);
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
    const response = await api.get(`/forms/templates/${templateId}/preview`, {
      responseType: 'blob'
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
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

  async getFieldMappings(templateId: string): Promise<FieldMapping[]> {
    const response = await api.get(`/forms/templates/${templateId}/field-mappings/`);
    return response.data;
  }

  async getFieldMapping(templateId: string, mappingId: string): Promise<FieldMapping> {
    const response = await api.get(`/forms/templates/${templateId}/field-mappings/${mappingId}/`);
    return response.data;
  }

  async createFieldMapping(templateId: string, data: CreateFieldMappingData): Promise<FieldMapping> {
    try {
      const requestData = {
        ...data,
        template: templateId
      };
      
      const response = await api.post(`/forms/templates/${templateId}/field-mappings/`, requestData);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async updateFieldMapping(templateId: string, mappingId: string, data: UpdateFieldMappingData): Promise<FieldMapping> {
    const response = await api.patch(`/forms/templates/${templateId}/field-mappings/${mappingId}/`, data);
    return response.data;
  }

  async deleteFieldMapping(templateId: string, mappingId: string): Promise<void> {
    await api.delete(`/forms/templates/${templateId}/field-mappings/${mappingId}/`);
  }

  async validateFieldMappings(templateId: string): Promise<{ valid: boolean; errors: string[] }> {
    const response = await api.post(`/forms/templates/${templateId}/validate-mappings`);
    return response.data;
  }

  async checkTemplateDeletable(templateId: string): Promise<{ deletable: boolean }> {
    const response = await api.get(`/forms/templates/${templateId}/check_deletable/`);
    return response.data;
  }

  async getTemplatesWithPagination(page: number, pageSize: number): Promise<{ count: number; next: string | null; previous: string | null; results: Template[] }> {
    const response = await api.get('/forms/templates/', {
      params: {
        page: page + 1,
        page_size: pageSize
      }
    });
    return response.data;
  }
}

export const templateService = new TemplateService();