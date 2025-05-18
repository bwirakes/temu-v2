import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SessionProvider } from '@/components/session-provider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import NotionHeader from './components/notion-header';
import NotionFooter from './components/notion-footer';
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'TEMU - Talent Empowerment Platform',
  description: 'Connecting talented individuals with opportunities that matter.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <body>
        <SessionProvider>
          <NotionHeader />
          <main className="min-h-screen">{children}</main>
          <NotionFooter />
          <ToastProvider />
        </SessionProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
