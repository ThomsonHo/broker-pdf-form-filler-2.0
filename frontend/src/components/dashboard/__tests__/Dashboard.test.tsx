import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import { MemoryRouter } from 'react-router-dom';
import { Dashboard } from '../Dashboard';
import theme from '../../../theme';
import { fetchDashboardData } from '../../../services/api';

// Mock the API
jest.mock('../../../services/api', () => ({
  fetchDashboardData: jest.fn(),
}));

// Mock data
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

describe('Dashboard', () => {
  beforeEach(() => {
    (fetchDashboardData as jest.Mock).mockClear();
  });

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

  it('renders dashboard data after loading', async () => {
    (fetchDashboardData as jest.Mock).mockResolvedValueOnce(mockDashboardData);

    renderDashboard();

    // Initially shows loading state
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    // Verify all dashboard metrics are displayed
    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('New Client')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    const error = { isAxiosError: true, message: 'API Error' };
    (fetchDashboardData as jest.Mock).mockRejectedValueOnce(error);

    renderDashboard();

    // Initially shows loading state
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/an unexpected error occurred/i)).toBeInTheDocument();
    });

    // Verify error metrics are displayed
    const metrics = screen.getAllByText('0');
    expect(metrics[0]).toHaveTextContent('0'); // Total clients
    expect(metrics[1]).toHaveTextContent('0'); // Active clients
    expect(metrics[2]).toHaveTextContent('0'); // Forms generated
    expect(screen.getByText('NaN%')).toBeInTheDocument(); // Quota usage
  });
}); 