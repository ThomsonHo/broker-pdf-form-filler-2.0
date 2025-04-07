import { Providers } from './providers';
import ClientPathChecker from '@/components/layout/ClientPathChecker';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          <ClientPathChecker>{children}</ClientPathChecker>
        </Providers>
      </body>
    </html>
  );
}
