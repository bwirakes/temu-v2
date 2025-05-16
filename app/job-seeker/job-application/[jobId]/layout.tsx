import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Apply for Job | Submit Your Application',
  description: 'Complete your job application form and submit your credentials',
};

export default function JobApplicationDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout completely overrides the parent layout
  // No header or sidebar will be shown
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
} 