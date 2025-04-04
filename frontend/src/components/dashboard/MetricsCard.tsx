import React from 'react';
import { Paper, Box, Typography, Icon } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: string;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({ title, value, icon }) => {
  const theme = useTheme();

  return (
    <Paper elevation={2}>
      <Box
        p={2}
        display="flex"
        flexDirection="column"
        alignItems="center"
        textAlign="center"
      >
        <Icon
          sx={{
            fontSize: 40,
            color: theme.palette.primary.main,
            marginBottom: 1
          }}
        >
          {icon}
        </Icon>
        <Typography variant="h6" component="div" gutterBottom>
          {value || '0'}
        </Typography>
        <Typography
          variant="subtitle2"
          color="textSecondary"
          sx={{ fontWeight: 500 }}
        >
          {title}
        </Typography>
      </Box>
    </Paper>
  );
}; 