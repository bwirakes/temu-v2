import './globals.css';
import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import { SessionProvider } from '@/components/session-provider';
import { ToastProvider } from '@/components/providers/ToastProvider';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: 'Temu - Talent Empowerment Platform',
  description: 'A platform connecting talent with opportunities',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="min-h-screen">
        <SessionProvider>
          {children}
          <ToastProvider />
        </SessionProvider>
      </body>
    </html>
  );
}
