import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { render } from '@/utils/test-utils';
import RegisterPage from '../register';
import { userService } from '@/services/userService';

// Mock the userService
jest.mock('@/services/userService');

describe('RegisterPage Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock the registerUser function
    (userService.registerUser as jest.Mock).mockResolvedValue({
      id: '1',
      email: 'user@example.com',
      first_name: 'John',
      last_name: 'Doe',
      role: 'standard',
      broker_company: 'Company X',
      email_verified: false,
    });
  });

  it('renders the registration form correctly', () => {
    render(<RegisterPage />);
    
    // Check if the title is displayed
    expect(screen.getByText(/register/i)).toBeInTheDocument();
    
    // Check if the form fields are displayed
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/broker company/i)).toBeInTheDocument();
    
    // Check if the submit button is displayed
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    
    // Check if the link to login is displayed
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
  });

  it('validates required fields when submitting the form', async () => {
    render(<RegisterPage />);
    
    // Get the submit button
    const submitButton = screen.getByRole('button', { name: /register/i });
    
    // Click the submit button without filling any fields
    fireEvent.click(submitButton);
    
    // Check if validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      expect(screen.getByText(/role is required/i)).toBeInTheDocument();
      expect(screen.getByText(/broker company is required/i)).toBeInTheDocument();
    });
    
    // Check if registerUser was not called
    expect(userService.registerUser).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    render(<RegisterPage />);
    
    // Get the email input
    const emailInput = screen.getByLabelText(/email/i);
    
    // Type an invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    // Get the submit button
    const submitButton = screen.getByRole('button', { name: /register/i });
    
    // Click the submit button
    fireEvent.click(submitButton);
    
    // Check if validation error is displayed
    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
    
    // Check if registerUser was not called
    expect(userService.registerUser).not.toHaveBeenCalled();
  });

  it('validates password match', async () => {
    render(<RegisterPage />);
    
    // Get the password inputs
    const passwordInput = screen.getByLabelText(/password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    
    // Type different passwords
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } });
    
    // Get the submit button
    const submitButton = screen.getByRole('button', { name: /register/i });
    
    // Click the submit button
    fireEvent.click(submitButton);
    
    // Check if validation error is displayed
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
    
    // Check if registerUser was not called
    expect(userService.registerUser).not.toHaveBeenCalled();
  });

  it('calls registerUser with form data when the form is valid', async () => {
    render(<RegisterPage />);
    
    // Fill in the form fields
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText(/role/i), { target: { value: 'standard' } });
    fireEvent.change(screen.getByLabelText(/broker company/i), { target: { value: 'Company X' } });
    
    // Get the submit button
    const submitButton = screen.getByRole('button', { name: /register/i });
    
    // Click the submit button
    fireEvent.click(submitButton);
    
    // Check if registerUser was called with the form data
    await waitFor(() => {
      expect(userService.registerUser).toHaveBeenCalledWith({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!',
        password2: 'Password123!',
        role: 'standard',
        broker_company: 'Company X',
      });
    });
  });

  it('displays success message when registration is successful', async () => {
    render(<RegisterPage />);
    
    // Fill in the form fields
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText(/role/i), { target: { value: 'standard' } });
    fireEvent.change(screen.getByLabelText(/broker company/i), { target: { value: 'Company X' } });
    
    // Get the submit button
    const submitButton = screen.getByRole('button', { name: /register/i });
    
    // Click the submit button
    fireEvent.click(submitButton);
    
    // Check if success message is displayed
    await waitFor(() => {
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
    });
  });

  it('displays error message when registration fails', async () => {
    // Mock the registerUser function to throw an error
    (userService.registerUser as jest.Mock).mockRejectedValueOnce(new Error('Email already exists'));
    
    render(<RegisterPage />);
    
    // Fill in the form fields
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'existing@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText(/role/i), { target: { value: 'standard' } });
    fireEvent.change(screen.getByLabelText(/broker company/i), { target: { value: 'Company X' } });
    
    // Get the submit button
    const submitButton = screen.getByRole('button', { name: /register/i });
    
    // Click the submit button
    fireEvent.click(submitButton);
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });
  });

  it('shows loading state while registering', async () => {
    // Mock the registerUser function to return a promise that never resolves
    (userService.registerUser as jest.Mock).mockImplementationOnce(() => new Promise(() => {}));
    
    render(<RegisterPage />);
    
    // Fill in the form fields
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText(/role/i), { target: { value: 'standard' } });
    fireEvent.change(screen.getByLabelText(/broker company/i), { target: { value: 'Company X' } });
    
    // Get the submit button
    const submitButton = screen.getByRole('button', { name: /register/i });
    
    // Click the submit button
    fireEvent.click(submitButton);
    
    // Check if loading state is displayed
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });
}); 