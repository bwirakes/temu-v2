"use client";

import { useEmployerOnboarding } from "@/lib/context/EmployerOnboardingContext";

const steps = [
  { id: 1, path: "informasi-perusahaan" },     // Step 1: Informasi Dasar Badan Usaha
  { id: 2, path: "kehadiran-online" },        // Step 2: Kehadiran Online dan Identitas Merek
  { id: 3, path: "penanggung-jawab" },        // Step 3: Penanggung Jawab (PIC)
  { id: 4, path: "konfirmasi" },              // Step 4: Konfirmasi dan Langkah Selanjutnya
];

export default function EmployerProgressBar() {
  const { currentStep } = useEmployerOnboarding();

  return (
    <div className="w-full py-4 px-2 sm:px-0">
      {/* Mobile View */}
      <div>
        <p className="text-sm font-medium text-indigo-600">
          Langkah {currentStep} dari {steps.length}
        </p>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-indigo-600 h-2.5 rounded-full"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
} 