'use client';

import React from 'react';
import { Box, Button, Icon, Grid, Typography } from '@mui/material';
import Link from 'next/link';
import DescriptionIcon from '@mui/icons-material/Description';

interface QuickLink {
  id: number;
  title: string;
  url: string;
  icon: string;
  description: string;
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
      icon: 'description',
      description: 'Generate new forms'
    }
  ];

  // Use provided links or default links
  const displayLinks = links.length > 0 ? links : defaultLinks;

  if (!Array.isArray(displayLinks)) {
    console.warn('QuickAccessPanel received non-array links:', displayLinks);
    return null;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Quick Access
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
        }}
      >
        {displayLinks.map((link) => (
          <Box key={link.id}>
            <Link href={link.url} passHref legacyBehavior>
              <Button
                component="a"
                variant="outlined"
                color="primary"
                fullWidth
                startIcon={link.icon === 'description' ? <DescriptionIcon /> : <Icon>{link.icon}</Icon>}
                sx={{
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  height: '100%',
                  p: 2,
                }}
              >
                <Box>
                  <Typography variant="subtitle1" component="div">
                    {link.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {link.description}
                  </Typography>
                </Box>
              </Button>
            </Link>
          </Box>
        ))}
      </Box>
    </Box>
  );
}; 