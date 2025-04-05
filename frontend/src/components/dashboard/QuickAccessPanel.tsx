'use client';

import React from 'react';
import { Box, Button, Icon, Grid } from '@mui/material';
import Link from 'next/link';

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
  if (!Array.isArray(links)) {
    console.warn('QuickAccessPanel received non-array links:', links);
    return null;
  }

  return (
    <Grid container spacing={2}>
      {links.map((link) => (
        <Grid item xs={12} sm={6} md={3} key={link.id}>
          <Link href={link.url} passHref legacyBehavior>
            <Button
              component="a"
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
          </Link>
        </Grid>
      ))}
    </Grid>
  );
}; 