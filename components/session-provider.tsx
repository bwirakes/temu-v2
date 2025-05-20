'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

export function SessionProvider({ children }: { children: ReactNode }) {
  return (
    <NextAuthSessionProvider 
      refetchOnWindowFocus={true}
      refetchInterval={60 * 5} // Refetch every 5 minutes
    >
      {children}
    </NextAuthSessionProvider>
  );
} 