"use client";

import EmployerOnboardingLayout from "@/components/employer-onboarding/EmployerOnboardingLayout";
import KehadiranOnlineForm from "@/components/employer-onboarding/forms/KehadiranOnlineForm";

export default function KehadiranOnlinePage() {
  return (
    <EmployerOnboardingLayout
      title="Kehadiran Online dan Identitas Merek"
      description="Tambahkan informasi mengenai kehadiran online dan identitas merek perusahaan Anda"
    >
      <KehadiranOnlineForm />
    </EmployerOnboardingLayout>
  );
} 