import { Metadata } from 'next';
import { ReactNode } from 'react';
import ClientLayout from './ClientLayout';

export const metadata: Metadata = {
  title: 'Job Application | Apply for Jobs',
  description: 'Apply for job positions with our easy-to-use job application form',
};

/**
 * Server component layout for the job application section.
 * It includes metadata and wraps the client component layout.
 */
export default function JobApplicationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
} 