import { render, screen } from '@testing-library/react';
import RootLayout from '../layout';

// Mock the Geist font
jest.mock('next/font/google', () => ({
  Geist: () => ({
    className: 'mock-font',
    variable: '--font-geist-sans',
    style: { fontFamily: 'mock-font' }
  }),
  Geist_Mono: () => ({
    className: 'mock-font-mono',
    variable: '--font-geist-mono',
    style: { fontFamily: 'mock-font-mono' }
  })
}));

describe('RootLayout', () => {
  it('renders children correctly', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('includes necessary meta tags', () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    // Check if the viewport meta tag is present
    const viewport = document.querySelector('meta[name="viewport"]');
    expect(viewport).toBeInTheDocument();
    expect(viewport?.getAttribute('content')).toBe('width=device-width, initial-scale=1');
  });
}); 