import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-200px)] px-4 py-10 sm:py-16 md:py-20">
      <div className="w-full max-w-md mx-auto">
        {children}
      </div>
    </main>
  );
} 