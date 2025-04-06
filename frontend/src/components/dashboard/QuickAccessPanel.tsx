'use client';

import React from 'react';
import { Box, Button, Icon, Grid } from '@mui/material';
import Link from 'next/link';
import DescriptionIcon from '@mui/icons-material/Description';

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
  // Default links if none are provided
  const defaultLinks: QuickLink[] = [
    {
      id: 1,
      title: 'Generate Forms',
      url: '/forms',
      icon: 'description'
    }
  ];

  // Use provided links or default links
  const displayLinks = links.length > 0 ? links : defaultLinks;

  if (!Array.isArray(displayLinks)) {
    console.warn('QuickAccessPanel received non-array links:', displayLinks);
    return null;
  }

  return (
    <Grid container spacing={2}>
      {displayLinks.map((link) => (
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
              {link.icon === 'description' ? (
                <DescriptionIcon />
              ) : (
                <Icon>{link.icon}</Icon>
              )}
              {link.title}
            </Button>
          </Link>
        </Grid>
      ))}
    </Grid>
  );
}; 