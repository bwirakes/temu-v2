import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="w-full max-w-md mx-auto p-6">
      {children}
    </main>
  );
} 