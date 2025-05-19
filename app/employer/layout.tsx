// This is now a Server Component
// Client-side functionality has been moved to EmployerLayoutWrapper component

import EmployerLayoutWrapper from "@/components/employer-layout-wrapper";

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server component that delegates client-side rendering to EmployerLayoutWrapper
  return <EmployerLayoutWrapper>{children}</EmployerLayoutWrapper>;
} 