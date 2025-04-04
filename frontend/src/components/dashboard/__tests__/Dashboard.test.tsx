import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import { MemoryRouter } from 'react-router-dom';
import { Dashboard } from '../Dashboard';
import { fetchDashboardData } from '../../../services/api';
import theme from '../../../theme';

// Mock the API call
jest.mock('../../../services/api', () => ({
  fetchDashboardData: jest.fn(),
}));

const mockDashboardData = {
  metrics: {
    total_clients: 100,
    active_clients: 75,
    forms_generated: 500,
    quota_usage: 60,
    metrics_by_type: {
      'Type A': 200,
      'Type B': 300,
    },
  },
  quick_links: [
    {
      id: 1,
      title: 'New Client',
      url: '/clients/new',
      icon: 'person_add',
    },
  ],
  user_quota: {
    used: 60,
    total: 100,
    remaining: 40,
  },
};

const renderDashboard = () => {
  return render(
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

describe('Dashboard', () => {
  beforeEach(() => {
    (fetchDashboardData as jest.Mock).mockResolvedValue(mockDashboardData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    renderDashboard();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders dashboard data after loading', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByText('100')).toBeInTheDocument(); // Total clients
    expect(screen.getByText('75')).toBeInTheDocument(); // Active clients
    expect(screen.getByText('500')).toBeInTheDocument(); // Forms generated
    expect(screen.getByText('60%')).toBeInTheDocument(); // Quota usage
    expect(screen.getByText('New Client')).toBeInTheDocument(); // Quick link
  });

  it('handles API errors gracefully', async () => {
    const error = new Error('API Error');
    (fetchDashboardData as jest.Mock).mockRejectedValue(error);

    renderDashboard();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Error message should be displayed via Snackbar
    expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
  });
}); 