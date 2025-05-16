import JobPostingLayout from "@/components/job-posting/JobPostingLayout";
import RequirementsForm from "@/components/job-posting/RequirementsForm";

export default function RequirementsPage() {
  return (
    <JobPostingLayout 
      title="Persyaratan" 
      description="Tentukan persyaratan yang harus dipenuhi oleh kandidat untuk posisi ini."
    >
      <RequirementsForm />
    </JobPostingLayout>
  );
} 