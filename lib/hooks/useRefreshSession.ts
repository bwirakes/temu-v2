'use client';

import { useState, useCallback } from 'react';
import { refreshAuthSession } from '../auth-utils';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

/**
 * Hook for refreshing the auth session after a meaningful change
 * (like completing onboarding) that should be reflected in JWT
 * 
 * Optimized version that prevents duplicate refreshes and handles
 * errors gracefully.
 */
export function useRefreshSession() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const { update } = useSession();

  /**
   * Refreshes the auth session and optionally redirects to a new path
   * @param redirectTo Optional URL to redirect to after refresh
   * @param forceRedirect If true, will redirect even if session refresh fails
   * @returns Promise resolving to success status
   */
  const refresh = useCallback(async (redirectTo?: string, forceRedirect = false) => {
    // Prevent multiple simultaneous refresh attempts
    if (isRefreshing) return false;
    
    setIsRefreshing(true);
    
    try {
      // First try to use the built-in Next Auth session update
      // This is faster than the fetch API call and preferred when available
      if (update) {
        await update({ onboardingCompleted: true });
      }
      
      // Then call our fetch-based refresh as a backup
      const success = await refreshAuthSession();
      
      // Refresh the router to ensure all components get updated data
      router.refresh();
      
      // Handle redirection
      if (redirectTo && (success || forceRedirect)) {
        router.push(redirectTo);
      }
      
      return success;
    } catch (error) {
      console.error('Error refreshing session:', error);
      
      // If force redirect is enabled, redirect anyway
      if (redirectTo && forceRedirect) {
        router.push(redirectTo);
      }
      
      return false;
    } finally {
      // Delay clearing the flag to prevent rapid sequential calls
      setTimeout(() => setIsRefreshing(false), 100);
    }
  }, [isRefreshing, router, update]);

  return { refresh, isRefreshing };
} 