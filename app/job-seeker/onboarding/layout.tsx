import { ReactNode } from "react";
import { OnboardingProvider } from "@/lib/context/OnboardingContext";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <OnboardingProvider>
      {children}
    </OnboardingProvider>
  );
}