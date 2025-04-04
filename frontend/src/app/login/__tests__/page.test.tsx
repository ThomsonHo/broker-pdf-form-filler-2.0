import { render, screen } from '@testing-library/react';
import LoginPage from '../page';

// Mock the LoginForm component
jest.mock('../../../components/auth/LoginForm', () => {
  return function MockLoginForm() {
    return (
      <div data-testid="mock-login-form">
        <form>
          <label htmlFor="email">Email Address</label>
          <input id="email" type="email" aria-label="email" />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" aria-label="password" />
          <button type="submit">Sign In</button>
        </form>
      </div>
    );
  };
});

describe('LoginPage', () => {
  it('renders login form correctly', () => {
    render(<LoginPage />);
    expect(screen.getByTestId('mock-login-form')).toBeInTheDocument();
  });
}); 