import JobPostingLayout from "@/components/job-posting/JobPostingLayout";
import AdditionalDetailsForm from "@/components/job-posting/AdditionalDetailsForm";

export default function AdditionalDetailsPage() {
  return (
    <JobPostingLayout 
      title="Detail Tambahan" 
      description="Masukkan detail tambahan tentang lowongan pekerjaan yang Anda buka."
    >
      <AdditionalDetailsForm />
    </JobPostingLayout>
  );
} 