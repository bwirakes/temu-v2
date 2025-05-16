import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Job Details | View Job Information',
  description: 'View detailed information about job opportunities and requirements',
};

export default function JobDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout completely overrides the parent layout
  // No header or sidebar will be shown on mobile
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
} 