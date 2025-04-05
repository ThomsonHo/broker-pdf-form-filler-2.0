'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const user = localStorage.getItem('user');

    if (!accessToken || !refreshToken || !user) {
      console.log('Missing authentication data:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        hasUser: !!user
      });
      router.push('/login');
    } else {
      router.push('/dashboard');
    }
  }, [router]);

  return null; // No need to render anything as we're redirecting
}
