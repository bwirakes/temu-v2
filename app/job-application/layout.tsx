import { ReactNode } from 'react';
import { SessionProvider } from '@/components/session-provider';

export default function JobApplicationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-notion-background">
        {children}
      </div>
    </SessionProvider>
  );
} 