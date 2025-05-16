"use client";

import EmployerOnboardingLayout from "@/components/employer-onboarding/EmployerOnboardingLayout";
import PenanggungJawabForm from "@/components/employer-onboarding/forms/PenanggungJawabForm";

export default function PenanggungJawabPage() {
  return (
    <EmployerOnboardingLayout
      title="Penanggung Jawab (PIC)"
      description="Informasi kontak penanggung jawab untuk keperluan administrasi"
    >
      <PenanggungJawabForm />
    </EmployerOnboardingLayout>
  );
} 