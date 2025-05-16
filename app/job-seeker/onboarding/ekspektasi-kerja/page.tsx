"use client";

import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import EkspektasiKerjaForm from "@/components/onboarding/forms/EkspektasiKerjaForm";

export default function EkspektasiKerjaPage() {
  return (
    <OnboardingLayout
      title="Preferensi Pekerjaan"
      description="Bantu kami memahami preferensi dan kebutuhan kamu dalam mencari pekerjaan"
    >
      <EkspektasiKerjaForm />
    </OnboardingLayout>
  );
} 