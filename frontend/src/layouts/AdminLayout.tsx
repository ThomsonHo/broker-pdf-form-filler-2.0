import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <span className="font-bold">Admin Panel</span>
            </a>
          </div>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <a
              className="transition-colors hover:text-foreground/80 text-foreground"
              href="/admin/standardized-fields"
            >
              Standardized Fields
            </a>
            <a
              className="transition-colors hover:text-foreground/80 text-foreground"
              href="/admin/templates"
            >
              Templates
            </a>
            <a
              className="transition-colors hover:text-foreground/80 text-foreground"
              href="/admin/users"
            >
              Users
            </a>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}; 