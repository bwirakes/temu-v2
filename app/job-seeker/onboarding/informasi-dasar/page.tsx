import InformasiDasarForm from "@/components/onboarding/forms/InformasiDasarForm";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";

export default function InformasiDasarPage() {
  return (
    <OnboardingLayout
      title="Informasi Dasar"
      description="Lengkapi data dasar untuk melanjutkan proses pendaftaran"
    >
      <InformasiDasarForm />
    </OnboardingLayout>
  );
} 