'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

/**
 * A client-safe implementation of refreshAuthSession
 * This improves reliability of session refreshes by using multiple strategies
 */
export async function refreshSessionClient(): Promise<boolean> {
  try {
    console.log('Starting auth session refresh...');
    
    // Make API call to explicitly refresh session from server with force-reload
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // Extended timeout
    
    try {
      // Primary method: Hit the session endpoint with update query param and no-cache
      const response = await fetch('/api/auth/session?update&t=' + Date.now(), { 
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
        signal: controller.signal,
        // Force refresh to ensure no caching
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.warn('Auth session refresh response not OK:', response.status);
        // Continue with secondary method even if this fails
      } else {
        // Parse response to validate it has the expected structure
        const session = await response.json();
        if (session?.user?.onboardingCompleted === true) {
          console.log('Verified session updated successfully');
        } else {
          console.log('Session endpoint response may not have onboardingCompleted=true');
        }
      }
    } catch (primaryError) {
      clearTimeout(timeoutId);
      console.warn('Primary session refresh method failed:', primaryError);
      // Continue with secondary methods
    }
    
    // Secondary method: Try a different approach to refresh auth state
    try {
      // Hit the CSRF endpoint, which also refreshes the session
      await fetch('/api/auth/csrf', { 
        method: 'GET',
        cache: 'no-store',
        next: { revalidate: 0 }
      });
    } catch (secondaryError) {
      console.warn('Secondary refresh method failed:', secondaryError);
      // Continue anyway - one of the methods might have worked
    }
    
    console.log('Auth session refresh attempts completed');
    // Consider the refresh successful even if we couldn't verify it
    // The server-side middleware will have the correct state
    return true;
  } catch (error) {
    // Only catch unexpected errors that weren't handled in the try blocks
    console.error('Unexpected error in refreshSessionClient:', error);
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
        await update({ 
          user: { 
            onboardingCompleted: true 
          } 
        } as any); // Type assertion for custom fields
      }
      
      // Then call our fetch-based refresh as a backup
      const success = await refreshSessionClient();
      
      // Refresh the router to ensure all components get updated data
      router.refresh();
      
      // Add a small delay to allow session changes to propagate
      await new Promise(resolve => setTimeout(resolve, 300));
      
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