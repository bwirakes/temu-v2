"use client";

import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import SocialMediaForm from "@/components/onboarding/forms/SocialMediaForm";

export default function SocialMediaPage() {
  return (
    <OnboardingLayout
      title="Media Sosial"
      description="Tambahkan tautan media sosial Anda (opsional)"
    >
      <SocialMediaForm />
    </OnboardingLayout>
  );
}