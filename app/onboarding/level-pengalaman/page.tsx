"use client";

import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import LevelPengalamanForm from "@/components/onboarding/forms/LevelPengalamanForm";

export default function LevelPengalamanPage() {
  return (
    <OnboardingLayout
      title="Level Pengalaman"
      description="Pilih level pengalaman kerja Anda"
    >
      <LevelPengalamanForm />
    </OnboardingLayout>
  );
}