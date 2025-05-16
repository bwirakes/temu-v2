import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Job Application | Apply for Jobs',
  description: 'Apply for job positions with our easy-to-use job application form',
};

export default function JobApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout doesn't need to override anything special
  // The parent layout will handle showing/hiding header and sidebar
  return children;
} 