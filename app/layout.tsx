import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SessionProvider } from '@/components/session-provider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import NotionHeader from './components/notion-header';
import NotionFooter from './components/notion-footer';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

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
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <SessionProvider>
          <ToastProvider />
          <Analytics/>
          <NotionHeader />
          {children}
          <NotionFooter />
        </SessionProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
