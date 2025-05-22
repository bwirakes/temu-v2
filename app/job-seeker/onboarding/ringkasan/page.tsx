"use client";

import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import RingkasanProfil from "@/components/onboarding/RingkasanProfil";
import { useOnboarding } from "@/lib/context/OnboardingContext";

export default function RingkasanPage() {
  // Use the existing client-side context instead of API calls
  const { currentStep } = useOnboarding();

  return (
    <OnboardingLayout
      title="Ringkasan Profil"
      description="Tinjau informasi yang telah Anda berikan sebelum menyelesaikan pendaftaran"
      currentStep={8} // Updated to the correct step (8)
    >
      <RingkasanProfil />
    </OnboardingLayout>
  );
}