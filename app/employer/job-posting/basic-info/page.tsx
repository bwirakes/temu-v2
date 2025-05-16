import JobPostingLayout from "@/components/job-posting/JobPostingLayout";
import BasicInfoForm from "@/components/job-posting/BasicInfoForm";

export default function BasicInfoPage() {
  return (
    <JobPostingLayout 
      title="Keterangan Dasar" 
      description="Masukkan informasi dasar tentang lowongan pekerjaan yang Anda buka."
    >
      <BasicInfoForm />
    </JobPostingLayout>
  );
} 