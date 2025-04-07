'use client';

import { usePathname } from 'next/navigation';
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';

// Paths that don't require the app layout
const publicPaths = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
];

interface ClientPathCheckerProps {
  children: React.ReactNode;
}

export default function ClientPathChecker({ children }: ClientPathCheckerProps) {
  const pathname = usePathname();
  const isPublicPath = publicPaths.some(path => pathname?.startsWith(path));

  return isPublicPath ? <>{children}</> : <AppLayout>{children}</AppLayout>;
} 