import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';

interface FormTypeChartProps {
  data: Record<string, number>;
}

export const FormTypeChart: React.FC<FormTypeChartProps> = ({ data = {} }) => {
  const theme = useTheme();

  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <Box height={300}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            tick={{ fill: theme.palette.text.secondary }}
          />
          <YAxis
            tick={{ fill: theme.palette.text.secondary }}
          />
          <Tooltip />
          <Bar
            dataKey="value"
            fill={theme.palette.primary.main}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}; 