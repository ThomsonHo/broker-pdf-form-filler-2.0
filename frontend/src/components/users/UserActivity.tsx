import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Divider,
  Chip,
} from '@mui/material';
import {
  Login as LoginIcon,
  Logout as LogoutIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Email as EmailIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { userService, UserActivity as UserActivityType } from '@/services/userService';

interface UserActivityProps {
  userId?: string;
  limit?: number;
  showTitle?: boolean;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'login':
      return <LoginIcon color="primary" />;
    case 'logout':
      return <LogoutIcon color="error" />;
    case 'update':
      return <EditIcon color="info" />;
    case 'delete':
      return <DeleteIcon color="error" />;
    case 'create':
      return <AddIcon color="success" />;
    case 'email_verification':
      return <EmailIcon color="warning" />;
    case 'password_change':
      return <LockIcon color="warning" />;
    default:
      return <LoginIcon />;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

export const UserActivity: React.FC<UserActivityProps> = ({
  userId,
  limit = 10,
  showTitle = true,
}) => {
  const [activities, setActivities] = useState<UserActivityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const data = await userService.getUserActivity(userId, limit);
        setActivities(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching user activity:', err);
        setError('Failed to load activity data');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [userId, limit]);

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

  if (activities.length === 0) {
    return (
      <Paper sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">No activity recorded</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      {showTitle && (
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
      )}
      
      <List>
        {activities.map((activity, index) => (
          <React.Fragment key={activity.id}>
            <ListItem>
              <ListItemIcon>
                {getActivityIcon(activity.type)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1">
                      {activity.description}
                    </Typography>
                    <Chip
                      label={activity.type}
                      size="small"
                      color={
                        activity.type === 'login'
                          ? 'primary'
                          : activity.type === 'logout'
                          ? 'error'
                          : activity.type === 'create'
                          ? 'success'
                          : 'default'
                      }
                    />
                  </Box>
                }
                secondary={formatDate(activity.timestamp)}
              />
            </ListItem>
            {index < activities.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default UserActivity; 