import React from 'react';
import { Box, Button, Icon, Grid } from '@mui/material';
import { Link } from 'react-router-dom';

interface QuickLink {
  id: number;
  title: string;
  url: string;
  icon: string;
}

interface QuickAccessPanelProps {
  links: QuickLink[];
}

export const QuickAccessPanel: React.FC<QuickAccessPanelProps> = ({ links = [] }) => {
  return (
    <Grid container spacing={2}>
      {links.map((link) => (
        <Grid item xs={12} sm={6} md={3} key={link.id}>
          <Button
            component={Link}
            to={link.url}
            variant="outlined"
            fullWidth
            sx={{
              py: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Icon>{link.icon}</Icon>
            {link.title}
          </Button>
        </Grid>
      ))}
    </Grid>
  );
}; 