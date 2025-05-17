import LevelPengalamanForm from "@/components/onboarding/forms/LevelPengalamanForm";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";

export default function LevelPengalamanPage() {
  return (
    <OnboardingLayout
      title="Level Pengalaman"
      description="Pilih level pengalaman kerja yang paling mendekati situasi Anda"
    >
      <LevelPengalamanForm />
    </OnboardingLayout>
  );
} 