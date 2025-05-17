import CVUploadForm from "@/components/onboarding/forms/CVUploadForm";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";

export default function CVUploadPage() {
  return (
    <OnboardingLayout
      title="Unggah CV/Resume"
      description="Unggah CV/Resume Anda untuk meningkatkan peluang mendapatkan pekerjaan"
    >
      <CVUploadForm />
    </OnboardingLayout>
  );
} 
