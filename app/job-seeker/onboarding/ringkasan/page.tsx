"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/lib/context/OnboardingContext";
import { useOnboardingApi } from "@/lib/hooks/useOnboardingApi";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import RingkasanProfil from "@/components/onboarding/RingkasanProfil";

export default function RingkasanPage() {
  const router = useRouter();
  const { data, isStepComplete } = useOnboarding();
  const { loadOnboardingData, isLoading } = useOnboardingApi();

  // Load data from the database when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        await loadOnboardingData();
      } catch (error) {
        console.error("Failed to load onboarding data:", error);
      }
    };

    fetchData();
  }, [loadOnboardingData]);

  // Redirect to incomplete steps if necessary
  useEffect(() => {
    if (!isLoading) {
      // Check if previous steps are complete
      for (let step = 1; step <= 9; step++) {
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
  }, [isLoading, isStepComplete, router, data]);

  return (
    <OnboardingLayout
      title="Ringkasan Profil"
      description="Tinjau informasi yang telah Anda berikan sebelum menyelesaikan pendaftaran"
    >
      <RingkasanProfil />
    </OnboardingLayout>
  );
}