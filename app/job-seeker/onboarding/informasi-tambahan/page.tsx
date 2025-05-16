"use client";

import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import InformasiTambahanForm from "@/components/onboarding/forms/InformasiTambahanForm";

export default function InformasiTambahanPage() {
  return (
    <OnboardingLayout
      title="Informasi Tambahan"
      description="Lengkapi informasi tambahan untuk profil Anda"
    >
      <InformasiTambahanForm />
    </OnboardingLayout>
  );
}