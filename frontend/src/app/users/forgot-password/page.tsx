'use client';

import React from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await requestPasswordReset(email);
      setSuccess(true);
      setError('');
    } catch (err) {
      setError('Failed to send password reset email. Please try again.');
      setSuccess(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 400,
          width: '100%',
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Forgot Password
        </Typography>
        {success ? (
          <Box>
            <Typography color="success.main" gutterBottom>
              Password reset instructions have been sent to your email.
            </Typography>
            <Button
              fullWidth
              variant="contained"
              onClick={() => router.push('/login')}
              sx={{ mt: 2 }}
            >
              Return to Login
            </Button>
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />
            {error && (
              <Typography color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
            <Button
              fullWidth
              type="submit"
              variant="contained"
              sx={{ mt: 3 }}
            >
              Send Reset Instructions
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={() => router.push('/login')}
              sx={{ mt: 1 }}
            >
              Back to Login
            </Button>
          </form>
        )}
      </Paper>
    </Box>
  );
} 