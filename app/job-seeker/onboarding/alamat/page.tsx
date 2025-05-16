"use client";

import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import AlamatForm from "@/components/onboarding/forms/AlamatForm";

export default function AlamatPage() {
  return (
    <OnboardingLayout
      title="Alamat"
      description="Masukkan informasi alamat tempat tinggal Anda"
    >
      <AlamatForm />
    </OnboardingLayout>
  );
}