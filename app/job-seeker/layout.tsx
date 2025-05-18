// This is now a Server Component
// Client-side functionality has been moved to JobSeekerLayoutWrapper component

import JobSeekerLayoutWrapper from "@/components/job-seeker-layout-wrapper";

export default function JobSeekerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server component that delegates client-side rendering to JobSeekerLayoutWrapper
  return <JobSeekerLayoutWrapper>{children}</JobSeekerLayoutWrapper>;
} 