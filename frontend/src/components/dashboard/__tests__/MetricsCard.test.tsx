import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { MetricsCard } from '../MetricsCard';
import theme from '../../../theme';

describe('MetricsCard', () => {
  const renderMetricsCard = (props: any) => {
    return render(
      <ThemeProvider theme={theme}>
        <MetricsCard {...props} />
      </ThemeProvider>
    );
  };

  it('renders metrics card with all props', () => {
    const props = {
      title: 'Total Users',
      value: '100',
      icon: 'people',
    };

    renderMetricsCard(props);

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('people')).toBeInTheDocument();
  });

  it('handles undefined value gracefully', () => {
    const props = {
      title: 'Total Users',
      value: undefined,
      icon: 'people',
    };

    renderMetricsCard(props);

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('handles null value gracefully', () => {
    const props = {
      title: 'Total Users',
      value: null,
      icon: 'people',
    };

    renderMetricsCard(props);

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders without icon', () => {
    const props = {
      title: 'Total Users',
      value: '100',
    };

    renderMetricsCard(props);

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });
}); 