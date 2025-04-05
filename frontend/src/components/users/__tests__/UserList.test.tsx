import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { render } from '@/utils/test-utils';
import { UserList } from '../UserList';
import { userService } from '@/services/userService';

// Mock the userService
jest.mock('@/services/userService');

// Mock the useAuth hook
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      role: 'admin',
      broker_company: 'Company A',
      is_superuser: true,
    },
  }),
}));

describe('UserList Component', () => {
  const mockUsers = [
    {
      id: '1',
      email: 'user1@example.com',
      first_name: 'User',
      last_name: 'One',
      role: 'admin',
      broker_company: 'Company A',
      tr_name: 'TR One',
      tr_license_number: 'TR123',
      tr_phone_number: '1234567890',
      is_tr: true,
      daily_form_quota: 10,
      monthly_form_quota: 100,
      email_verified: true,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    },
    {
      id: '2',
      email: 'user2@example.com',
      first_name: 'User',
      last_name: 'Two',
      role: 'standard',
      broker_company: 'Company B',
      tr_name: null,
      tr_license_number: null,
      tr_phone_number: null,
      is_tr: false,
      daily_form_quota: 5,
      monthly_form_quota: 50,
      email_verified: false,
      created_at: '2023-01-02T00:00:00Z',
      updated_at: '2023-01-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock the listUsers function
    (userService.listUsers as jest.Mock).mockResolvedValue({
      results: mockUsers,
      count: mockUsers.length,
    });
  });

  it('renders user list correctly', async () => {
    render(<UserList onEditUser={jest.fn()} onDeleteUser={jest.fn()} />);
    
    // Wait for the users to be loaded
    await waitFor(() => {
      expect(userService.listUsers).toHaveBeenCalled();
    });
    
    // Check if user names are displayed
    expect(screen.getByText('User One')).toBeInTheDocument();
    expect(screen.getByText('User Two')).toBeInTheDocument();
    
    // Check if emails are displayed
    expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    expect(screen.getByText('user2@example.com')).toBeInTheDocument();
    
    // Check if roles are displayed
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('standard')).toBeInTheDocument();
    
    // Check if companies are displayed
    expect(screen.getByText('Company A')).toBeInTheDocument();
    expect(screen.getByText('Company B')).toBeInTheDocument();
  });

  it('handles search functionality', async () => {
    render(<UserList onEditUser={jest.fn()} onDeleteUser={jest.fn()} />);
    
    // Wait for the users to be loaded
    await waitFor(() => {
      expect(userService.listUsers).toHaveBeenCalled();
    });
    
    // Get the search input
    const searchInput = screen.getByLabelText(/search users/i);
    
    // Type in the search input
    fireEvent.change(searchInput, { target: { value: 'user1' } });
    
    // Wait for the search to be applied
    await waitFor(() => {
      expect(userService.listUsers).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'user1' })
      );
    });
  });

  it('handles role filter functionality', async () => {
    render(<UserList onEditUser={jest.fn()} onDeleteUser={jest.fn()} />);
    
    // Wait for the users to be loaded
    await waitFor(() => {
      expect(userService.listUsers).toHaveBeenCalled();
    });
    
    // Get the role filter
    const roleFilter = screen.getByLabelText(/role/i);
    
    // Change the role filter
    fireEvent.mouseDown(roleFilter);
    const adminOption = screen.getByText('Admin');
    fireEvent.click(adminOption);
    
    // Wait for the filter to be applied
    await waitFor(() => {
      expect(userService.listUsers).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'admin' })
      );
    });
  });

  it('handles pagination', async () => {
    render(<UserList onEditUser={jest.fn()} onDeleteUser={jest.fn()} />);
    
    // Wait for the users to be loaded
    await waitFor(() => {
      expect(userService.listUsers).toHaveBeenCalled();
    });
    
    // Get the next page button
    const nextPageButton = screen.getByRole('button', { name: /next page/i });
    
    // Click the next page button
    fireEvent.click(nextPageButton);
    
    // Wait for the page to change
    await waitFor(() => {
      expect(userService.listUsers).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      );
    });
  });

  it('calls onEditUser when edit button is clicked', async () => {
    const onEditUser = jest.fn();
    render(<UserList onEditUser={onEditUser} onDeleteUser={jest.fn()} />);
    
    // Wait for the users to be loaded
    await waitFor(() => {
      expect(userService.listUsers).toHaveBeenCalled();
    });
    
    // Find the edit button by its icon
    const editButtons = screen.getAllByTestId('EditIcon');
    
    // Click the first edit button
    fireEvent.click(editButtons[0]);
    
    // Check if onEditUser was called with the correct user
    expect(onEditUser).toHaveBeenCalledWith(mockUsers[0]);
  });

  it('calls onDeleteUser when delete button is clicked', async () => {
    const onDeleteUser = jest.fn();
    render(<UserList onEditUser={jest.fn()} onDeleteUser={onDeleteUser} />);
    
    // Wait for the users to be loaded
    await waitFor(() => {
      expect(userService.listUsers).toHaveBeenCalled();
    });
    
    // Find the delete button by its icon
    const deleteButtons = screen.getAllByTestId('DeleteIcon');
    
    // Click the first delete button
    fireEvent.click(deleteButtons[0]);
    
    // Check if onDeleteUser was called with the correct user id
    expect(onDeleteUser).toHaveBeenCalledWith(mockUsers[0].id);
  });
}); 