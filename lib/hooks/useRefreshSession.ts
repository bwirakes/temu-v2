'use client';

import { useState } from 'react';
import { refreshAuthSession } from '../auth-utils';
import { useRouter } from 'next/navigation';

/**
 * Hook for refreshing the auth session after a meaningful change
 * (like completing onboarding) that should be reflected in JWT
 * 
 * @returns A function to refresh the auth session and optionally redirect after
 */
export function useRefreshSession() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  /**
   * Refreshes the auth session and optionally redirects to a new path
   * @param redirectTo Optional URL to redirect to after refresh
   * @returns Promise resolving to success status
   */
  const refresh = async (redirectTo?: string) => {
    setIsRefreshing(true);
    try {
      const success = await refreshAuthSession();
      
      // Refresh the router to ensure all components get updated data
      router.refresh();
      
      if (redirectTo && success) {
        router.push(redirectTo);
      }
      
      return success;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };

  return { refresh, isRefreshing };
} 