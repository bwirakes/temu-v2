import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Jobs | Find Your Next Career',
  description: 'Browse job opportunities and find positions that match your skills and experience',
};

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout doesn't need to override anything special
  // The parent layout will handle showing/hiding header and sidebar
  return children;
} 