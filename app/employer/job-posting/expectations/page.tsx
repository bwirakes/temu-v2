import JobPostingLayout from "@/components/job-posting/JobPostingLayout";
import ExpectationsForm from "@/components/job-posting/ExpectationsForm";

export default function ExpectationsPage() {
  return (
    <JobPostingLayout 
      title="Harapan Perusahaan" 
      description="Tentukan harapan perusahaan terhadap kandidat yang akan mengisi posisi ini."
    >
      <ExpectationsForm />
    </JobPostingLayout>
  );
} 