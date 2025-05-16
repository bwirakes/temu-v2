import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SessionMonitor from './components/session-monitor';

export const metadata = {
  title: 'Job Fair Nasional Tahun 2025',
  description: 'Jelajahi peluang kerja dari perusahaan terkemuka.',
};

export default function CareersLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <SessionMonitor />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
} 