import ProfilePhotoForm from "@/components/onboarding/forms/ProfilePhotoForm";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";

export default function ProfilePhotoPage() {
  return (
    <OnboardingLayout
      title="Foto Profil"
      description="Unggah foto profil untuk melengkapi profil Anda"
    >
      <ProfilePhotoForm />
    </OnboardingLayout>
  );
} 