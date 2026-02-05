'use client';

import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export function Layout({ children, className = '' }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      <Navbar
        user={{ username: 'TestUser' }}
        onLogout={() => console.log('Logout')}
      />

      <main className={`flex-1 pt-16 ${className}`}>
        {children}
      </main>

      <Footer />
    </div>
  );
}
