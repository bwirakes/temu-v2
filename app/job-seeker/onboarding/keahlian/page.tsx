"use client";

import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import KeahlianForm from "@/components/onboarding/forms/KeahlianForm";

export default function KeahlianPage() {
  return (
    <OnboardingLayout
      title="Keahlian"
      description="Tambahkan keahlian yang Anda miliki untuk meningkatkan peluang mendapatkan pekerjaan"
    >
      <KeahlianForm />
    </OnboardingLayout>
  );
}