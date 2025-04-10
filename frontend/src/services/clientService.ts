import { api } from './api';

export interface Client {
  id: string;
  id_number: string;
  data?: Record<string, any>;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  // For backward compatibility
  full_name?: string;
  full_address?: string;
  // Dynamic fields will be accessible as properties
  [key: string]: any;
}

export interface ClientField {
  id: string;
  name: string;
  label: string;
  field_type: string;
  field_category: string;
  display_category: string;
  display_order: number;
  is_required: boolean;
  is_client_field: boolean;
  is_core_field: boolean;
  is_filterable: boolean;
  options?: any;
  default_value?: any;
  placeholder?: string;
  help_text?: string;
  validation_rules?: any[];
}

export interface ClientListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Client[];
}

export interface ClientFilters {
  search?: string;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
  name?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
  // Dynamic filters
  [key: string]: any;
}

// Fetch clients with optional filters
export const fetchClients = async (filters: ClientFilters = {}): Promise<ClientListResponse> => {
  const params = new URLSearchParams();
  
  // Add filters to params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  
  const response = await api.get(`clients/?${params.toString()}`);
  return response.data;
};

// Fetch a single client by ID
export const fetchClientById = async (id: string): Promise<Client> => {
  const response = await api.get(`clients/${id}/`);
  return response.data;
};

// Create a new client
export const createClient = async (clientData: Partial<Client>): Promise<Client> => {
  try {
    console.log('Creating client with data:', clientData);
    const response = await api.post('clients/', clientData);
    console.log('Create response:', response);
    return response.data;
  } catch (error: any) {
    console.error('Error creating client:', error);
    console.error('Error response:', error.response);
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    console.error('Request URL:', error.config?.url);
    console.error('Request method:', error.config?.method);
    console.error('Request headers:', error.config?.headers);
    
    // Provide more specific error messages based on status code
    if (error.response?.status === 405) {
      throw new Error('Server does not support POST method for this endpoint. Please check API configuration.');
    } else if (error.response?.status === 401) {
      throw new Error('Unauthorized. Please log in again.');
    } else if (error.response?.status === 403) {
      throw new Error('Forbidden. You do not have permission to create clients.');
    } else if (error.response?.status === 400) {
      // Handle validation errors
      const errorData = error.response.data;
      if (typeof errorData === 'object') {
        const errorMessages = Object.entries(errorData)
          .map(([field, message]) => `${field}: ${message}`)
          .join(', ');
        throw new Error(`Validation error: ${errorMessages}`);
      }
      throw new Error(`Bad request: ${JSON.stringify(errorData)}`);
    }
    
    throw error;
  }
};

// Update an existing client
export const updateClient = async (id: string, clientData: Partial<Client>): Promise<Client> => {
  try {
    console.log(`Updating client ${id} with data:`, clientData);
    const url = `clients/${id}/`;
    console.log('Update URL:', url);
    
    // Try using PATCH first
    try {
      const response = await api.patch(url, clientData);
      console.log('PATCH response:', response);
      return response.data;
    } catch (error: any) {
      // If PATCH fails with 405, try PUT
      if (error.response && error.response.status === 405) {
        console.log('PATCH not allowed, trying PUT');
        const response = await api.put(url, clientData);
        console.log('PUT response:', response);
        return response.data;
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error updating client:', error);
    console.error('Error response:', error.response);
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    throw error;
  }
};

// Delete a client
export const deleteClient = async (id: string): Promise<void> => {
  await api.delete(`/clients/${id}/`);
};

// Toggle client active status
export const toggleClientActive = async (id: string): Promise<{ status: string }> => {
  const response = await api.post(`/clients/${id}/toggle_active/`);
  return response.data;
};

// Export clients to CSV
export const exportClients = async (filters: ClientFilters = {}): Promise<Blob> => {
  const params = new URLSearchParams();
  
  // Add filters to params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  
  const response = await api.get(`/clients/export/?${params.toString()}`, {
    responseType: 'blob',
  });
  return response.data;
};

// Fetch client field definitions
export const getClientFields = async (): Promise<ClientField[]> => {
  const response = await api.get('clients/field_definitions/');
  return response.data;
};

// Fetch core client fields (displayed in listings)
export const getCoreClientFields = async (): Promise<ClientField[]> => {
  const response = await api.get('clients/core_fields/');
  return response.data;
};

// Fetch filterable client fields
export const getFilterableClientFields = async (): Promise<ClientField[]> => {
  const response = await api.get('clients/filterable_fields/');
  return response.data;
};  