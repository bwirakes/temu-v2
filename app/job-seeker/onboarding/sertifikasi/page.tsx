"use client";

import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import SertifikasiForm from "@/components/onboarding/forms/SertifikasiForm";

export default function SertifikasiPage() {
  return (
    <OnboardingLayout
      title="Sertifikasi"
      description="Tambahkan sertifikasi yang Anda miliki untuk meningkatkan profil"
    >
      <SertifikasiForm />
    </OnboardingLayout>
  );
}