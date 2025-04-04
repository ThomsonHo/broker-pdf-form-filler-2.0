import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface QuotaProps {
  quota: {
    used: number;
    total: number;
    remaining: number;
  };
}

export const QuotaUsage: React.FC<QuotaProps> = ({ quota }) => {
  const theme = useTheme();
  const percentage = quota ? (quota.used / quota.total) * 100 : 0;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={1}>
        <Typography variant="body2" color="textSecondary">
          Used: {quota?.used || 0}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Total: {quota?.total || 0}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={Math.min(percentage, 100)}
        sx={{
          height: 10,
          borderRadius: 5,
          backgroundColor: theme.palette.grey[200],
          '& .MuiLinearProgress-bar': {
            borderRadius: 5,
            backgroundColor: percentage > 90 
              ? theme.palette.error.main 
              : theme.palette.primary.main
          }
        }}
      />
      <Box display="flex" justifyContent="center" mt={1}>
        <Typography
          variant="body2"
          color={percentage > 90 ? 'error' : 'textSecondary'}
        >
          {quota?.remaining || 0} forms remaining this month
        </Typography>
      </Box>
    </Box>
  );
}; 