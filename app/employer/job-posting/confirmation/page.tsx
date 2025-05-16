import JobPostingLayout from "@/components/job-posting/JobPostingLayout";
import ConfirmationForm from "@/components/job-posting/ConfirmationForm";

export default function ConfirmationPage() {
  return (
    <JobPostingLayout 
      title="Konfirmasi Lowongan" 
      description="Periksa kembali informasi lowongan pekerjaan Anda sebelum mengirimkan."
    >
      <ConfirmationForm />
    </JobPostingLayout>
  );
} 