"use client";

import { ReactNode } from "react";
import { JobPostingProvider, ContractType, JobPostingData } from "@/lib/context/JobPostingContext";

// Sample data to display in the job application
const sampleJobData: Partial<JobPostingData> = {
  jobTitle: "Senior Frontend Developer",
  numberOfPositions: 2,
  responsibilities: "- Develop and maintain responsive web applications using React and Next.js\n- Collaborate with UI/UX designers to implement visual elements\n- Optimize applications for maximum speed and scalability\n- Work with backend developers to integrate REST APIs\n- Write clean, maintainable, and well-documented code",
  workLocations: [
    {
      address: "Jl. Sudirman No. 123",
      city: "Jakarta",
      province: "DKI Jakarta",
      isRemote: false
    },
    {
      address: "",
      city: "Bandung",
      province: "Jawa Barat",
      isRemote: true
    }
  ],
  workingHours: "Senin-Jumat, 09:00-17:00",
  salaryRange: {
    min: 15000000,
    max: 25000000,
    isNegotiable: true
  },
  gender: "ANY",
  minWorkExperience: 3,
  requiredDocuments: "- KTP\n- Ijazah S1/S2\n- Portfolio\n- Sertifikat keahlian terkait",
  specialSkills: "- Problem solving\n- Kemampuan analitis yang baik\n- Komunikasi efektif",
  technologicalSkills: "- React.js/Next.js (Expert)\n- TypeScript (Advanced)\n- CSS/Tailwind CSS (Advanced)\n- Git (Intermediate)\n- Testing frameworks (Intermediate)",
  ageRange: {
    min: 25,
    max: 40
  },
  expectedCharacter: "- Mampu bekerja dalam tim\n- Proaktif dan inisiatif\n- Teliti dan detail-oriented\n- Mampu bekerja di bawah tekanan\n- Memiliki keinginan belajar yang tinggi",
  foreignLanguage: "Bahasa Inggris (minimal pasif)",
  suitableForDisability: true,
  contractType: "FULL_TIME",
  applicationDeadline: new Date("2023-12-31")
};

export default function JobPostingProviderWithSampleData({
  children,
}: {
  children: ReactNode;
}) {
  // Use the JobPostingProvider but override the initial data with our sample data
  return (
    <JobPostingProvider initialData={sampleJobData}>
      {children}
    </JobPostingProvider>
  );
} 
