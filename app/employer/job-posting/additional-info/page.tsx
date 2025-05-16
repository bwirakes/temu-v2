import JobPostingLayout from "@/components/job-posting/JobPostingLayout";
import AdditionalInfoForm from "@/components/job-posting/AdditionalInfoForm";

export default function AdditionalInfoPage() {
  return (
    <JobPostingLayout 
      title="Informasi Tambahan" 
      description="Tambahkan informasi lainnya untuk melengkapi lowongan pekerjaan Anda."
    >
      <AdditionalInfoForm />
    </JobPostingLayout>
  );
} 