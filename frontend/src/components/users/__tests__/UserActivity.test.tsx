import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { render } from '@/utils/test-utils';
import { UserActivity } from '../UserActivity';
import { userService } from '@/services/userService';

// Mock the userService
jest.mock('@/services/userService', () => ({
  userService: {
    getUserActivity: jest.fn(),
  },
}));

const mockActivities = [
  {
    id: '1',
    type: 'login',
    description: 'User logged in',
    timestamp: '2024-03-20T10:00:00Z',
  },
  {
    id: '2',
    type: 'update',
    description: 'Profile updated',
    timestamp: '2024-03-20T11:00:00Z',
  },
  {
    id: '3',
    type: 'logout',
    description: 'User logged out',
    timestamp: '2024-03-20T12:00:00Z',
  },
];

describe('UserActivity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (userService.getUserActivity as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );

    render(<UserActivity />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error state when API call fails', async () => {
    (userService.getUserActivity as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<UserActivity />);
    await waitFor(() => {
      expect(screen.getByText('Failed to load activity data')).toBeInTheDocument();
    });
  });

  it('renders empty state when no activities', async () => {
    (userService.getUserActivity as jest.Mock).mockResolvedValue([]);

    render(<UserActivity />);
    await waitFor(() => {
      expect(screen.getByText('No activity recorded')).toBeInTheDocument();
    });
  });

  it('renders activities correctly', async () => {
    (userService.getUserActivity as jest.Mock).mockResolvedValue(mockActivities);

    render(<UserActivity />);
    
    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      expect(screen.getByText('User logged in')).toBeInTheDocument();
      expect(screen.getByText('Profile updated')).toBeInTheDocument();
      expect(screen.getByText('User logged out')).toBeInTheDocument();
    });
  });

  it('hides title when showTitle is false', async () => {
    (userService.getUserActivity as jest.Mock).mockResolvedValue(mockActivities);

    render(<UserActivity showTitle={false} />);
    
    await waitFor(() => {
      expect(screen.queryByText('Recent Activity')).not.toBeInTheDocument();
    });
  });

  it('passes userId and limit to the service', async () => {
    (userService.getUserActivity as jest.Mock).mockResolvedValue(mockActivities);

    render(<UserActivity userId="123" limit={5} />);
    
    await waitFor(() => {
      expect(userService.getUserActivity).toHaveBeenCalledWith('123', 5);
    });
  });

  it('displays formatted dates', async () => {
    (userService.getUserActivity as jest.Mock).mockResolvedValue(mockActivities);

    render(<UserActivity />);
    
    await waitFor(() => {
      // The exact format will depend on the user's locale, so we'll just check for the presence of the date
      expect(screen.getByText(/Mar 20, 2024/)).toBeInTheDocument();
    });
  });
}); 