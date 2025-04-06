import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  CircularProgress,
  Tooltip,
  Grid,
  Divider,
} from '@mui/material';
import { userService, QuotaUsage } from '@/services/userService';

interface QuotaDisplayProps {
  showTitle?: boolean;
}

export const QuotaDisplay: React.FC<QuotaDisplayProps> = ({ showTitle = true }) => {
  const [quotaUsage, setQuotaUsage] = useState<QuotaUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuotaUsage = async () => {
      try {
        setLoading(true);
        const data = await userService.getQuotaUsage();
        setQuotaUsage(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching quota usage:', err);
        setError('Failed to load quota usage data');
      } finally {
        setLoading(false);
      }
    };

    fetchQuotaUsage();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  if (!quotaUsage) {
    return null;
  }

  const dailyPercentage = (quotaUsage.daily_usage / quotaUsage.daily_quota) * 100;
  const monthlyPercentage = (quotaUsage.monthly_usage / quotaUsage.monthly_quota) * 100;

  return (
    <Paper sx={{ p: 3 }}>
      {showTitle && (
        <Typography variant="h6" gutterBottom>
          Quota Usage
        </Typography>
      )}
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        <Box>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle1">Daily Usage</Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {quotaUsage.daily_usage} / {quotaUsage.daily_quota}
              </Typography>
            </Box>
            <Tooltip title={`${dailyPercentage.toFixed(1)}% used`}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(dailyPercentage, 100)}
                  color={dailyPercentage > 90 ? 'error' : dailyPercentage > 70 ? 'warning' : 'primary'}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
            </Tooltip>
            {!quotaUsage.has_daily_quota && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                Daily quota exceeded
              </Typography>
            )}
          </Box>
        </Box>
        
        <Box>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle1">Monthly Usage</Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {quotaUsage.monthly_usage} / {quotaUsage.monthly_quota}
              </Typography>
            </Box>
            <Tooltip title={`${monthlyPercentage.toFixed(1)}% used`}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(monthlyPercentage, 100)}
                  color={monthlyPercentage > 90 ? 'error' : monthlyPercentage > 70 ? 'warning' : 'primary'}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
            </Tooltip>
            {!quotaUsage.has_monthly_quota && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                Monthly quota exceeded
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="body2" color="text.secondary">
        Quota resets at the beginning of each day for daily usage and at the beginning of each month for monthly usage.
      </Typography>
    </Paper>
  );
};

export default QuotaDisplay; 