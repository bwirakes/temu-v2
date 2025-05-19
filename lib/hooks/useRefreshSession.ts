'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

/**
 * A client-safe implementation of refreshAuthSession
 * This avoids importing server-only modules in client components
 */
export async function refreshSessionClient(): Promise<boolean> {
  try {
    console.log('Starting auth session refresh...');
    
    // Use AbortController to set a timeout on the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    // Using a no-cache fetch with signal for timeout control
    const response = await fetch('/api/auth/session?update', { 
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
      signal: controller.signal
    });
    
    // Clear timeout once request completes
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.warn('Auth session refresh response not OK:', response.status);
      return false;
    }
    
    // We don't need to parse the response, just confirm it happened
    console.log('Auth session refreshed successfully');
    return true;
  } catch (error) {
    // Don't treat AbortError as a failure since we're just timing out the request
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('Auth session refresh timed out, continuing...');
      return true; // Assume it worked to prevent blocking the user
    }
    
    console.error('Failed to refresh auth session:', error);
    return false;
  }
}

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
      const success = await refreshSessionClient();
      
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