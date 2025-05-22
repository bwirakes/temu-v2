"use client";

import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import PendidikanForm from "@/components/onboarding/forms/PendidikanForm";

export default function PendidikanPage() {
  return (
    <OnboardingLayout
      title="Riwayat Pendidikan"
      description="Masukan pendidikan terakhir kamu untuk menunjukkan kualifikasi akademis kamu"
      currentStep={3}
    >
      <PendidikanForm />
    </OnboardingLayout>
  );
}