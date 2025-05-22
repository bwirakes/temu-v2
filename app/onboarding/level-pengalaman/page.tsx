"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import LevelPengalamanForm from "@/components/onboarding/forms/LevelPengalamanForm";
import { useOnboarding } from "@/lib/context/OnboardingContext";

export default function LevelPengalamanPage() {
  const router = useRouter();
  const { isLoading } = useOnboarding();
  
  // If using the default no-op context, redirect to the job-seeker path
  useEffect(() => {
    // Add a small delay to ensure we're not redirecting during SSR
    const timeout = setTimeout(() => {
      // We can detect if we're using the real context by checking if certain methods work
      try {
        // Check if we can successfully call a method that should be wired up
        if (!isLoading) {
          // If we're here, we have real context data, so we can render normally
          return;
        }
        
        // If we're still loading after a while, redirect to the job-seeker path
        console.log("Redirecting to job-seeker path...");
        router.replace("/job-seeker/onboarding/level-pengalaman");
      } catch (error) {
        console.error("Error in context detection, redirecting:", error);
        router.replace("/job-seeker/onboarding/level-pengalaman");
      }
    }, 1000); // Wait 1 second to avoid unnecessary redirects
    
    return () => clearTimeout(timeout);
  }, [router, isLoading]);
  
  return (
    <OnboardingLayout
      title="Level Pengalaman"
      description="Pilih level pengalaman kerja Anda"
    >
      <LevelPengalamanForm />
    </OnboardingLayout>
  );
}