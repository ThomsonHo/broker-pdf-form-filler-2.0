'use client';

import dynamic from 'next/dynamic';

const ClientsPageClient = dynamic(
  () => import('./ClientsPageClient'),
  { ssr: false }
);

export default function ClientsPageWrapper() {
  return <ClientsPageClient />;
} 