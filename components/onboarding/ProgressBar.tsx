"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useOnboarding } from "@/lib/context/OnboardingContext";

const steps = [
  { id: 1, path: "informasi-pribadi" },       // Step 1: Informasi Dasar
  { id: 2, path: "informasi-lanjutan" },      // Step 2: Informasi Lanjutan
  { id: 3, path: "alamat" },                  // Step 3: Alamat
  { id: 4, path: "social-media" },            // Step 4: Social Media
  { id: 5, path: "upload-foto" },             // Step 5: Upload Foto Profil
  { id: 6, path: "level-pengalaman" },        // Step 6: Level Pengalaman
  { id: 7, path: "pengalaman-kerja" },        // Step 7: Pengalaman Kerja
  { id: 8, path: "pendidikan" },              // Step 8: Pendidikan
  { id: 9, path: "keahlian" },                // Step 9: Keahlian
  { id: 10, path: "sertifikasi" },            // Step 10: Sertifikasi
  { id: 11, path: "bahasa" },                 // Step 11: Bahasa
  { id: 12, path: "informasi-tambahan" },     // Step 12: Informasi Tambahan
  { id: 13, path: "ekspektasi-kerja" },       // Step 13: Ekspektasi Kerja
  { id: 14, path: "ringkasan" },              // Step 14: Ringkasan
];

export default function ProgressBar() {
  const { currentStep, setCurrentStep, completedSteps } = useOnboarding();
  const pathname = usePathname();

  // Synchronize the current step with the URL path
  useEffect(() => {
    const currentPath = pathname.split("/").pop();
    const matchedStep = steps.find(step => step.path === currentPath);
    
    if (matchedStep && matchedStep.id !== currentStep) {
      setCurrentStep(matchedStep.id);
    }
  }, [pathname, currentStep, setCurrentStep]);

  // Calculate progress percentage based on completed steps
  const progressPercentage = completedSteps.length > 0
    ? (completedSteps.length / steps.length) * 100
    : (currentStep / steps.length) * 100;

  return (
    <div className="w-full py-4 px-2 sm:px-0">
      <div>
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium text-blue-600">
            Langkah {currentStep} dari {steps.length}
          </p>
          <p className="text-xs text-gray-500">
            {completedSteps.length} langkah selesai
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