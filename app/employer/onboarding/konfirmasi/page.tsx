"use client";

import EmployerOnboardingLayout from "@/components/employer-onboarding/EmployerOnboardingLayout";
import KonfirmasiForm from "@/components/employer-onboarding/forms/KonfirmasiForm";

export default function KonfirmasiPage() {
  return (
    <EmployerOnboardingLayout
      title="Konfirmasi dan Langkah Selanjutnya"
      description="Tinjau dan konfirmasi informasi yang telah Anda berikan"
    >
      <KonfirmasiForm />
    </EmployerOnboardingLayout>
  );
} 