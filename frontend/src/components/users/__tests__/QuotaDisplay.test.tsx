import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { render } from '@/utils/test-utils';
import { QuotaDisplay } from '../QuotaDisplay';
import { userService } from '@/services/userService';

// Mock the userService
jest.mock('@/services/userService', () => ({
  userService: {
    getQuotaUsage: jest.fn(),
  },
}));

const mockQuotaUsage = {
  daily_usage: 75,
  daily_quota: 100,
  has_daily_quota: true,
  monthly_usage: 250,
  monthly_quota: 1000,
  has_monthly_quota: true,
};

describe('QuotaDisplay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (userService.getQuotaUsage as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );

    render(<QuotaDisplay />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error state when API call fails', async () => {
    (userService.getQuotaUsage as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<QuotaDisplay />);
    await waitFor(() => {
      expect(screen.getByText('Failed to load quota usage data')).toBeInTheDocument();
    });
  });

  it('renders quota usage data correctly', async () => {
    (userService.getQuotaUsage as jest.Mock).mockResolvedValue(mockQuotaUsage);

    render(<QuotaDisplay />);
    
    await waitFor(() => {
      expect(screen.getByText('Quota Usage')).toBeInTheDocument();
      expect(screen.getByText('Daily Usage')).toBeInTheDocument();
      expect(screen.getByText('Monthly Usage')).toBeInTheDocument();
      expect(screen.getByText('75 / 100')).toBeInTheDocument();
      expect(screen.getByText('250 / 1000')).toBeInTheDocument();
    });
  });

  it('shows warning state when usage is high', async () => {
    const highUsage = {
      ...mockQuotaUsage,
      daily_usage: 85,
      monthly_usage: 850,
    };
    (userService.getQuotaUsage as jest.Mock).mockResolvedValue(highUsage);

    render(<QuotaDisplay />);
    
    await waitFor(() => {
      const progressBars = screen.getAllByRole('progressbar');
      expect(progressBars[0]).toHaveStyle({ color: 'warning.main' });
      expect(progressBars[1]).toHaveStyle({ color: 'warning.main' });
    });
  });

  it('shows error state when quota is exceeded', async () => {
    const exceededQuota = {
      ...mockQuotaUsage,
      daily_usage: 110,
      has_daily_quota: false,
      monthly_usage: 1100,
      has_monthly_quota: false,
    };
    (userService.getQuotaUsage as jest.Mock).mockResolvedValue(exceededQuota);

    render(<QuotaDisplay />);
    
    await waitFor(() => {
      expect(screen.getByText('Daily quota exceeded')).toBeInTheDocument();
      expect(screen.getByText('Monthly quota exceeded')).toBeInTheDocument();
    });
  });

  it('hides title when showTitle is false', async () => {
    (userService.getQuotaUsage as jest.Mock).mockResolvedValue(mockQuotaUsage);

    render(<QuotaDisplay showTitle={false} />);
    
    await waitFor(() => {
      expect(screen.queryByText('Quota Usage')).not.toBeInTheDocument();
    });
  });
}); 