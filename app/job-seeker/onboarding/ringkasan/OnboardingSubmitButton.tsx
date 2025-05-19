'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRefreshSession } from '@/lib/hooks/useRefreshSession';
import { useRouter } from 'next/navigation';

export function OnboardingSubmitButton() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { refresh, isRefreshing } = useRefreshSession();
  const router = useRouter();
  
  const isLoading = isSubmitting || isRefreshing;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Submit the final onboarding data
      const response = await fetch('/api/job-seeker/onboarding/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete onboarding');
      }
      
      console.log('Onboarding completed successfully');
      
      // Refresh the session to update the JWT with onboardingCompleted=true
      await refresh(data.redirectUrl || '/job-seeker/dashboard');
      
    } catch (error) {
      console.error('Error submitting onboarding:', error);
      // You can add toast notification here for error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button 
      onClick={handleSubmit} 
      disabled={isLoading}
      className="w-full md:w-auto px-8" 
      size="lg"
    >
      {isLoading ? 'Memproses...' : 'Selesai & Mulai Mencari Kerja'}
    </Button>
  );
} 