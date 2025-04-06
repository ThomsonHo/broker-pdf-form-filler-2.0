'use client';

import { Providers } from './providers';
import { usePathname } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';

// Paths that don't require the app layout
const publicPaths = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPublicPath = publicPaths.some(path => pathname?.startsWith(path));

  return (
    <html lang="en">
      <head>
        <title>PDF Form Filler</title>
        <meta name="description" content="A tool for managing and filling PDF forms" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, fontFamily: 'Inter, sans-serif' }}>
        <Providers>
          {isPublicPath ? children : <AppLayout>{children}</AppLayout>}
        </Providers>
      </body>
    </html>
  );
}
