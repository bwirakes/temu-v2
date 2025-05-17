"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/lib/context/OnboardingContext";
import { useOnboardingApi } from "@/lib/hooks/useOnboardingApi";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import RingkasanProfil from "@/components/onboarding/RingkasanProfil";

export default function RingkasanPage() {
  const router = useRouter();
  const { data, isStepComplete } = useOnboarding();
  const { loadOnboardingData, isLoading } = useOnboardingApi();
  const [hasLoadedData, setHasLoadedData] = useState(false);

  // Load data from the database when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (!hasLoadedData) {
        try {
          await loadOnboardingData();
          setHasLoadedData(true);
        } catch (error) {
          console.error("Failed to load onboarding data:", error);
        }
      }
    };

    fetchData();
  }, [loadOnboardingData, hasLoadedData]);

  // Redirect to incomplete steps if necessary
  useEffect(() => {
    if (!isLoading && hasLoadedData) {
      // Check if previous required steps are complete (skip optional ones)
      const requiredSteps = [1, 2, 3, 4, 5, 7]; // Only check non-optional steps
      
      for (const step of requiredSteps) {
        if (!isStepComplete(step)) {
          const stepRoutes = [
            "/job-seeker/onboarding/informasi-dasar",     // Step 1: Informasi Dasar
            "/job-seeker/onboarding/informasi-lanjutan",  // Step 2: Informasi Lanjutan
            "/job-seeker/onboarding/alamat",              // Step 3: Alamat
            "/job-seeker/onboarding/pendidikan",          // Step 4: Pendidikan
            "/job-seeker/onboarding/level-pengalaman",    // Step 5: Level Pengalaman
            "/job-seeker/onboarding/pengalaman-kerja",    // Step 6: Pengalaman Kerja
            "/job-seeker/onboarding/ekspektasi-kerja",    // Step 7: Ekspektasi Kerja
            "/job-seeker/onboarding/cv-upload",           // Step 8: CV Upload
            "/job-seeker/onboarding/foto-profile",        // Step 9: Foto Profile
          ];
          
          if (stepRoutes[step - 1]) {
            router.push(stepRoutes[step - 1]);
            return;
          }
        }
      }
    }
  }, [isLoading, isStepComplete, router, hasLoadedData]);

  return (
    <OnboardingLayout
      title="Ringkasan Profil"
      description="Tinjau informasi yang telah Anda berikan sebelum menyelesaikan pendaftaran"
    >
      <RingkasanProfil />
    </OnboardingLayout>
  );
}