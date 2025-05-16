import { JobPostingProvider } from "@/lib/context/JobPostingContext";

export default function JobPostingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <JobPostingProvider>
      {children}
    </JobPostingProvider>
  );
} 