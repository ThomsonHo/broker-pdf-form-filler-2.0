'use client';

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

interface DashboardData {
  metrics: {
    total_clients: number;
    active_clients: number;
    forms_generated: number;
    quota_usage: number;
    metrics_by_type: Record<string, number>;
  };
  quick_links: Array<{
    id: number;
    title: string;
    url: string;
    icon: string;
  }>;
  user_quota: {
    used: number;
    total: number;
    remaining: number;
  };
}

export const Dashboard: React.FC = () => {
  const theme = useTheme();
  const { handleError } = useErrorHandler();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await fetchDashboardData();
        setDashboardData(data);
      } catch (error) {
        handleError(error);
        // Set default data on error
        setDashboardData({
          metrics: {
            total_clients: 0,
            active_clients: 0,
            forms_generated: 0,
            quota_usage: 0,
            metrics_by_type: {},
          },
          quick_links: [],
          user_quota: {
            used: 0,
            total: 0,
            remaining: 0,
          },
        });
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

  const { metrics, quick_links, user_quota } = dashboardData || {
    metrics: {
      total_clients: 0,
      active_clients: 0,
      forms_generated: 0,
      quota_usage: 0,
      metrics_by_type: {},
    },
    quick_links: [],
    user_quota: {
      used: 0,
      total: 0,
      remaining: 0,
    },
  };

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
              <QuickAccessPanel links={quick_links || []} />
            </Box>
          </Paper>
        </Grid>

        {/* Metrics Cards */}
        <Grid item xs={12} md={3}>
          <MetricsCard
            title="Total Clients"
            value={metrics?.total_clients || 0}
            icon="people"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricsCard
            title="Active Clients"
            value={metrics?.active_clients || 0}
            icon="people_outline"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricsCard
            title="Forms Generated"
            value={metrics?.forms_generated || 0}
            icon="description"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricsCard
            title="Quota Usage"
            value={`${Math.round(metrics?.quota_usage || 0)}%`}
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
              <FormTypeChart data={metrics?.metrics_by_type || {}} />
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
              <QuotaUsage quota={user_quota || { used: 0, total: 0, remaining: 0 }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 