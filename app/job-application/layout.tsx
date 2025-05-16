import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Job Application | Create and Share Job Postings',
  description: 'Create professional job postings with our easy-to-use job application builder',
};

export default function JobApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="job-application-layout">
      {children}
    </div>
  );
} 