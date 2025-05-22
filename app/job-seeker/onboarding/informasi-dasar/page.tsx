import InformasiDasarForm from "@/components/onboarding/forms/InformasiDasarForm";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { auth } from "lib/auth";

export default async function InformasiDasarPage() {
  // Get authentication session
  const session = await auth();
  const userName = session?.user?.name || "";
  const userEmail = session?.user?.email || "";

  return (
    <OnboardingLayout
      title="Informasi Dasar"
      description="Lengkapi data dasar untuk melanjutkan proses pendaftaran"
      currentStep={1}
    >
      <InformasiDasarForm userName={userName} userEmail={userEmail} />
    </OnboardingLayout>
  );
} 