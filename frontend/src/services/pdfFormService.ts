import axios from 'axios';
import { API_URL } from '@/config';

export interface FormTemplate {
  id: string;
  name: string;
  file_name: string;
  description: string;
  category: string;
  template_file: string;
  is_active: boolean;
  field_mappings: FormFieldMapping[];
  created_at: string;
  updated_at: string;
}

export interface FormFieldMapping {
  id: string;
  pdf_field_name: string;
  system_field_name: string;
}

export interface GeneratedForm {
  id: string;
  template: string;
  template_name: string;
  status: 'processing' | 'completed' | 'failed';
  error_message: string;
  created_at: string;
  download_url: string;
}

export interface FormGenerationBatch {
  id: string;
  status: 'processing' | 'completed' | 'partial' | 'failed';
  insurer: string;
  created_at: string;
  forms: GeneratedForm[];
  total_forms: number;
  completed_forms: number;
  failed_forms: number;
  download_url: string;
  client?: {
    id: string;
    name: string;
  };
}

class PDFFormService {
  private baseUrl = `${API_URL}/forms`;

  async getTemplates(category?: string): Promise<FormTemplate[]> {
    const params = category ? { category } : undefined;
    const response = await axios.get(`${this.baseUrl}/templates/`, { params });
    return response.data;
  }

  async getTemplate(id: string): Promise<FormTemplate> {
    const response = await axios.get(`${this.baseUrl}/templates/${id}/`);
    return response.data;
  }

  async updateFieldMappings(templateId: string, mappings: FormFieldMapping[]): Promise<void> {
    await axios.post(`${this.baseUrl}/templates/${templateId}/update_field_mappings/`, {
      mappings
    });
  }

  async generateForms(
    clientId: string,
    templateIds: string[],
    clientData: Record<string, any>,
    insurer?: string
  ): Promise<FormGenerationBatch> {
    const response = await axios.post(`${this.baseUrl}/batches/`, {
      client_id: clientId,
      template_ids: templateIds,
      client_data: clientData,
      insurer
    });
    return response.data;
  }

  async getBatch(id: string): Promise<FormGenerationBatch> {
    const response = await axios.get(`${this.baseUrl}/batches/${id}/`);
    return response.data;
  }

  async getBatches(): Promise<FormGenerationBatch[]> {
    const response = await axios.get(`${this.baseUrl}/batches/`);
    return response.data;
  }

  async downloadForm(id: string): Promise<Blob> {
    const response = await axios.get(`${this.baseUrl}/forms/${id}/download/`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async downloadBatch(id: string): Promise<Blob> {
    const response = await axios.get(`${this.baseUrl}/batches/${id}/download_forms/`, {
      responseType: 'blob'
    });
    return response.data;
  }
}

export const pdfFormService = new PDFFormService(); 