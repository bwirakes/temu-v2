"use client";

import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import BahasaForm from "@/components/onboarding/forms/BahasaForm";

export default function BahasaPage() {
  return (
    <OnboardingLayout
      title="Bahasa"
      description="Tambahkan kemampuan bahasa yang Anda kuasai"
    >
      <BahasaForm />
    </OnboardingLayout>
  );
}