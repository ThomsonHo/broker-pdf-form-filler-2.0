import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { FormTypeChart } from '../FormTypeChart';
import theme from '../../../theme';

describe('FormTypeChart', () => {
  const mockData: Record<string, number> = {
    'Type A': 200,
    'Type B': 300,
    'Type C': 150,
  };

  const renderFormTypeChart = (data: Record<string, number> = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <div style={{ width: '500px', height: '300px' }}>
          <FormTypeChart data={data} />
        </div>
      </ThemeProvider>
    );
  };

  it('renders chart with data', () => {
    renderFormTypeChart(mockData);

    // Check if the chart container is rendered
    const chartContainer = screen.getByTestId('form-type-chart');
    expect(chartContainer).toBeInTheDocument();
    expect(chartContainer).toHaveStyle({ height: '300px' });
  });

  it('handles undefined data gracefully', () => {
    renderFormTypeChart(undefined);

    // Should still render the chart container
    const chartContainer = screen.getByTestId('form-type-chart');
    expect(chartContainer).toBeInTheDocument();
  });

  it('handles empty data object gracefully', () => {
    renderFormTypeChart({});

    // Should still render the chart container
    const chartContainer = screen.getByTestId('form-type-chart');
    expect(chartContainer).toBeInTheDocument();
  });

  it('renders chart with single data point', () => {
    renderFormTypeChart({
      'Type A': 100,
    });

    // Should render the chart container
    const chartContainer = screen.getByTestId('form-type-chart');
    expect(chartContainer).toBeInTheDocument();
  });
}); 