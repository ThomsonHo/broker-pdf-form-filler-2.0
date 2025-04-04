import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { QuotaUsage } from '../QuotaUsage';
import theme from '../../../theme';

interface QuotaData {
  used: number;
  total: number;
  remaining: number;
}

interface QuotaProps {
  quota?: QuotaData;
}

describe('QuotaUsage', () => {
  const mockQuota: QuotaData = {
    used: 60,
    total: 100,
    remaining: 40,
  };

  const renderQuotaUsage = (quota?: QuotaData) => {
    return render(
      <ThemeProvider theme={theme}>
        <QuotaUsage quota={quota || { used: 0, total: 0, remaining: 0 }} />
      </ThemeProvider>
    );
  };

  it('renders quota usage information', () => {
    renderQuotaUsage(mockQuota);

    expect(screen.getByText('Used: 60')).toBeInTheDocument();
    expect(screen.getByText('Total: 100')).toBeInTheDocument();
    expect(screen.getByText('40 forms remaining this month')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('handles undefined quota gracefully', () => {
    renderQuotaUsage(undefined);

    expect(screen.getByText('Used: 0')).toBeInTheDocument();
    expect(screen.getByText('Total: 0')).toBeInTheDocument();
    expect(screen.getByText('0 forms remaining this month')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('handles zero total quota gracefully', () => {
    renderQuotaUsage({
      used: 0,
      total: 0,
      remaining: 0,
    });

    expect(screen.getByText('Used: 0')).toBeInTheDocument();
    expect(screen.getByText('Total: 0')).toBeInTheDocument();
    expect(screen.getByText('0 forms remaining this month')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays correct percentage for partial usage', () => {
    renderQuotaUsage({
      used: 25,
      total: 100,
      remaining: 75,
    });

    expect(screen.getByText('Used: 25')).toBeInTheDocument();
    expect(screen.getByText('Total: 100')).toBeInTheDocument();
    expect(screen.getByText('75 forms remaining this month')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
  });

  it('handles full quota usage', () => {
    renderQuotaUsage({
      used: 100,
      total: 100,
      remaining: 0,
    });

    expect(screen.getByText('Used: 100')).toBeInTheDocument();
    expect(screen.getByText('Total: 100')).toBeInTheDocument();
    expect(screen.getByText('0 forms remaining this month')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });
}); 