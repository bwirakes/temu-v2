import CVUploadForm from "@/components/onboarding/forms/CVUploadForm";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";

export default function CVUploadPage() {
  return (
    <OnboardingLayout
      title="Unggah CV/Resume"
      description="CV/Resume Anda wajib diunggah dan akan dilihat oleh perekrut saat Anda melamar pekerjaan"
      currentStep={6}
    >
      <CVUploadForm />
    </OnboardingLayout>
  );
} 
