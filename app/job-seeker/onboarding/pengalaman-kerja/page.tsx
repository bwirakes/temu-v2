"use client";

import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import PengalamanKerjaForm from "@/components/onboarding/forms/PengalamanKerjaForm";

export default function PengalamanKerjaPage() {
  return (
    <OnboardingLayout
      title="Pengalaman Kerja"
      description="Tambahkan pengalaman kerja Anda untuk menunjukkan keahlian profesional"
    >
      <PengalamanKerjaForm />
    </OnboardingLayout>
  );
}