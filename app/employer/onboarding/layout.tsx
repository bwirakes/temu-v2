"use client";

import { EmployerOnboardingProvider } from "@/lib/context/EmployerOnboardingContext";

export default function EmployerOnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EmployerOnboardingProvider>
      {children}
    </EmployerOnboardingProvider>
  );
} 