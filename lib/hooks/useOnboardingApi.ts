"use client";

import { useState } from "react";
import { useOnboarding } from "@/lib/context/OnboardingContext";

export function useOnboardingApi() {
  const { data, updateFormValues } = useOnboarding();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveStep = async (step: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/job-seeker/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          step,
          data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save data");
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loadOnboardingData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/job-seeker/onboarding", {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load data");
      }

      const { data: onboardingData } = await response.json();
      
      if (onboardingData) {
        updateFormValues(onboardingData);
      }

      return onboardingData;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveStep,
    loadOnboardingData,
    isLoading,
    error,
  };
} 