"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useOnboarding } from "@/lib/context/OnboardingContext";

const steps = [
  { id: 1, path: "informasi-dasar" },      // Step 1: Informasi Dasar
  { id: 2, path: "informasi-lanjutan" },   // Step 2: Informasi Lanjutan
  { id: 3, path: "alamat" },               // Step 3: Alamat
  { id: 4, path: "pendidikan" },           // Step 4: Pendidikan
  { id: 5, path: "level-pengalaman" },     // Step 5: Level Pengalaman
  { id: 6, path: "pengalaman-kerja" },     // Step 6: Pengalaman Kerja
  { id: 7, path: "ekspektasi-kerja" },     // Step 7: Ekspektasi Kerja
  { id: 8, path: "cv-upload" },            // Step 8: CV Upload
  { id: 9, path: "foto-profile" },         // Step 9: Foto Profile
  { id: 10, path: "ringkasan" },           // Step 10: Ringkasan
];

export default function ProgressBar() {
  const { currentStep, setCurrentStep, completedSteps, isStepComplete } = useOnboarding();
  const pathname = usePathname();

  // Calculate the number of completed steps based on the isStepComplete function
  const calculatedCompletedSteps = useMemo(() => {
    const completed = [];
    for (let i = 1; i <= steps.length; i++) {
      if (i < currentStep || isStepComplete(i)) {
        completed.push(i);
      }
    }
    return [...new Set(completed)]; // Ensure uniqueness
  }, [currentStep, isStepComplete]);

  // Synchronize the current step with the URL path
  useEffect(() => {
    const currentPath = pathname.split("/").pop();
    const matchedStep = steps.find(step => step.path === currentPath);
    
    if (matchedStep && matchedStep.id !== currentStep) {
      setCurrentStep(matchedStep.id);
    }
  }, [pathname, currentStep, setCurrentStep]);

  // Calculate progress percentage based on completed steps
  // Use both the stored completedSteps and calculated ones for most accurate representation
  const allCompletedSteps = useMemo(() => {
    return [...new Set([...completedSteps, ...calculatedCompletedSteps])];
  }, [completedSteps, calculatedCompletedSteps]);

  const progressPercentage = Math.min(
    100, // Cap at 100%
    (allCompletedSteps.length / steps.length) * 100
  );

  return (
    <div className="w-full py-4 px-2 sm:px-0">
      <div>
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium text-blue-600">
            Langkah {currentStep} dari {steps.length}
          </p>
          <p className="text-xs text-gray-500">
            {allCompletedSteps.length} langkah selesai
          </p>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
} 