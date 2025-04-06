'use client';

import React, { useEffect, useState } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  CircularProgress,
  useTheme,
  Box,
  Button
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
    description: string;
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
          quick_links: [
            {
              id: 1,
              title: 'Generate Forms',
              url: '/forms',
              icon: 'description',
              description: 'Create and fill PDF forms',
            },
            {
              id: 2,
              title: 'Manage Clients',
              url: '/clients',
              icon: 'people',
              description: 'View and manage client information',
            },
            {
              id: 3,
              title: 'Templates',
              url: '/templates',
              icon: 'folder',
              description: 'Manage form templates',
            },
            {
              id: 4,
              title: 'Reports',
              url: '/reports',
              icon: 'assessment',
              description: 'View analytics and reports',
            },
          ],
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
      
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: 3,
        }}
      >
        {/* Quick Access Panel */}
        <Box sx={{ gridColumn: 'span 12' }}>
          <Paper elevation={2}>
            <Box p={2}>
              <QuickAccessPanel links={quick_links || []} />
            </Box>
          </Paper>
        </Box>

        {/* Metrics Cards */}
        <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 3' } }}>
          <Paper elevation={2}>
            <Box p={2}>
              <Typography variant="h6" gutterBottom>
                Total Clients
              </Typography>
              <Typography variant="h4">{metrics?.total_clients || 0}</Typography>
            </Box>
          </Paper>
        </Box>
        <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 3' } }}>
          <Paper elevation={2}>
            <Box p={2}>
              <Typography variant="h6" gutterBottom>
                Active Clients
              </Typography>
              <Typography variant="h4">{metrics?.active_clients || 0}</Typography>
            </Box>
          </Paper>
        </Box>
        <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 3' } }}>
          <Paper elevation={2}>
            <Box p={2}>
              <Typography variant="h6" gutterBottom>
                Forms Generated
              </Typography>
              <Typography variant="h4">{metrics?.forms_generated || 0}</Typography>
            </Box>
          </Paper>
        </Box>
        <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 3' } }}>
          <Paper elevation={2}>
            <Box p={2}>
              <Typography variant="h6" gutterBottom>
                Quota Usage
              </Typography>
              <Typography variant="h4">{`${Math.round(metrics?.quota_usage || 0)}%`}</Typography>
            </Box>
          </Paper>
        </Box>

        {/* Charts */}
        <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 8' } }}>
          <Paper elevation={2}>
            <Box p={2}>
              <Typography variant="h6" gutterBottom>
                Form Generation by Type
              </Typography>
              <FormTypeChart data={metrics?.metrics_by_type || {}} />
            </Box>
          </Paper>
        </Box>

        {/* User Quota */}
        <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
          <Paper elevation={2}>
            <Box p={2}>
              <Typography variant="h6" gutterBottom>
                Your Monthly Quota
              </Typography>
              <QuotaUsage quota={user_quota || { used: 0, total: 0, remaining: 0 }} />
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}; 