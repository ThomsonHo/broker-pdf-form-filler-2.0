import { api } from './api';

export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  date_of_birth: string;
  gender: 'M' | 'F' | 'O';
  marital_status: 'single' | 'married' | 'divorced' | 'widowed';
  id_number: string;
  nationality: string;
  phone_number: string;
  email: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  full_address: string;
  employer?: string;
  occupation?: string;
  work_address?: string;
  annual_income?: number;
  monthly_expenses?: number;
  tax_residency?: string;
  payment_method?: string;
  payment_period?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
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
  nationality?: string;
  country?: string;
  city?: string;
  start_date?: string;
  end_date?: string;
  name?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
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
  
  const response = await api.get(`/clients/?${params.toString()}`);
  return response.data;
};

// Fetch a single client by ID
export const fetchClientById = async (id: string): Promise<Client> => {
  const response = await api.get(`/clients/${id}/`);
  return response.data;
};

// Create a new client
export const createClient = async (clientData: Partial<Client>): Promise<Client> => {
  const response = await api.post('/clients/', clientData);
  return response.data;
};

// Update an existing client
export const updateClient = async (id: string, clientData: Partial<Client>): Promise<Client> => {
  const response = await api.put(`/clients/${id}/`, clientData);
  return response.data;
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