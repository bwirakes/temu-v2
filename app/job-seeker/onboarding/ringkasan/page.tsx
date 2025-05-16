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
      for (let step = 1; step < 13; step++) {
        if (!isStepComplete(step)) {
          const stepRoutes = [
            "/onboarding/informasi-dasar",
            "/onboarding/informasi-lanjutan",
            "/onboarding/alamat",
            "/onboarding/social-media",
            "/onboarding/foto-profil",
            "/onboarding/level-pengalaman",
            "/onboarding/pengalaman-kerja",
            "/onboarding/pendidikan",
            "/onboarding/keahlian",
            "/onboarding/sertifikasi",
            "/onboarding/bahasa",
            "/onboarding/informasi-tambahan",
            "/onboarding/ekspektasi-kerja"
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