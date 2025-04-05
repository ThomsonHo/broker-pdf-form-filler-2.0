import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Link } from '@mui/material';

const NotFoundPage: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
        }}
      >
        <Typography variant="h1" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </Typography>
        <Link href="/dashboard" underline="none">
          <Button variant="contained" color="primary" size="large">
            Go to Dashboard
          </Button>
        </Link>
      </Box>
    </Container>
  );
};

export default NotFoundPage; 