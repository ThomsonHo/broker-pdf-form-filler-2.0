'use client';

import React, { useEffect, useState, Suspense } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Button,
  Link,
  Container,
} from '@mui/material';
import NextLink from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { userService } from '@/services/userService';
import { useAuth } from '@/hooks/useAuth';

type Status = 'loading' | 'success' | 'error';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  const router = useRouter();
  const { user: currentUser, updateUser } = useAuth();
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setError('Invalid verification token');
        return;
      }

      try {
        const updatedUser = await userService.verifyEmail(token);
        if (currentUser) {
          await updateUser(updatedUser);
        }
        setStatus('success');
        // Redirect to login page after a short delay if user is not logged in
        if (!currentUser) {
          setTimeout(() => {
            router.push('/users/login');
          }, 3000);
        } else {
          // Redirect to dashboard if user is logged in
          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
        }
      } catch (error) {
        console.error('Error verifying email:', error);
        setStatus('error');
        setError('Failed to verify email. Please try again.');
      }
    };

    verifyEmail();
  }, [token, router, currentUser, updateUser]);

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          {status === 'loading' && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <CircularProgress />
            </Box>
          )}

          {status === 'success' && (
            <>
              <Typography variant="h5" gutterBottom color="success.main">
                Email Verified Successfully!
              </Typography>
              <Typography>
                {currentUser
                  ? 'Redirecting to dashboard...'
                  : 'Redirecting to login page...'}
              </Typography>
            </>
          )}

          {status === 'error' && (
            <Typography variant="h5" gutterBottom color="error">
              {error}
            </Typography>
          )}
        </Paper>
      </Box>
    </Container>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<CircularProgress />}>
      <VerifyEmailContent />
    </Suspense>
  );
} 