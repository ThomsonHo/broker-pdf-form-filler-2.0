import React, { useEffect, useState } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  CircularProgress,
  useTheme,
  Box
} from '@mui/material';
import { MetricsCard } from './MetricsCard';
import { QuickAccessPanel } from './QuickAccessPanel';
import { QuotaUsage } from './QuotaUsage';
import { FormTypeChart } from './FormTypeChart';
import { fetchDashboardData } from '../../services/api';
import { useErrorHandler } from '../../hooks/useErrorHandler';

export const Dashboard: React.FC = () => {
  const theme = useTheme();
  const { handleError } = useErrorHandler();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await fetchDashboardData();
        setDashboardData(data);
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
    // Refresh data every minute
    const interval = setInterval(loadDashboardData, 60000);
    return () => clearInterval(interval);
  }, [handleError]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const { metrics, quick_links, user_quota } = dashboardData || {};

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom color="primary">
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Quick Access Panel */}
        <Grid item xs={12}>
          <Paper elevation={2}>
            <Box p={2}>
              <QuickAccessPanel links={quick_links} />
            </Box>
          </Paper>
        </Grid>

        {/* Metrics Cards */}
        <Grid item xs={12} md={3}>
          <MetricsCard
            title="Total Clients"
            value={metrics?.total_clients}
            icon="people"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricsCard
            title="Active Clients"
            value={metrics?.active_clients}
            icon="people_outline"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricsCard
            title="Forms Generated"
            value={metrics?.forms_generated}
            icon="description"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricsCard
            title="Quota Usage"
            value={`${Math.round(metrics?.quota_usage)}%`}
            icon="pie_chart"
          />
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2}>
            <Box p={2}>
              <Typography variant="h6" gutterBottom>
                Form Generation by Type
              </Typography>
              <FormTypeChart data={metrics?.metrics_by_type} />
            </Box>
          </Paper>
        </Grid>

        {/* User Quota */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2}>
            <Box p={2}>
              <Typography variant="h6" gutterBottom>
                Your Monthly Quota
              </Typography>
              <QuotaUsage quota={user_quota} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 