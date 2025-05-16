"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useJobPosting } from "@/lib/context/JobPostingContext";

const steps = [
  { id: 1, path: "basic-info" },        // Step 1: Keterangan Dasar
  { id: 2, path: "requirements" },      // Step 2: Persyaratan
  { id: 3, path: "expectations" },      // Step 3: Harapan Perusahaan
  { id: 4, path: "additional-info" },   // Step 4: Lainnya
  { id: 5, path: "confirmation" },      // Step 5: Konfirmasi
];

export default function ProgressBar() {
  const { currentStep, setCurrentStep } = useJobPosting();
  const pathname = usePathname();

  // Synchronize the current step with the URL path
  useEffect(() => {
    if (!pathname) return;

    const currentPath = pathname.split("/").pop();
    if (!currentPath) return;
    
    const matchedStep = steps.find(step => step.path === currentPath);
    
    if (matchedStep && matchedStep.id !== currentStep) {
      setCurrentStep(matchedStep.id);
    }
  }, [pathname, currentStep, setCurrentStep]);

  return (
    <div className="w-full py-4 px-2 sm:px-0">
      {/* Mobile View */}
      <div>
        <p className="text-sm font-medium text-blue-600">
          Langkah {currentStep} dari {steps.length}
        </p>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
} 