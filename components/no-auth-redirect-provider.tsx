'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Provider that prevents authentication redirects for specific pages
 * like the 404 page. This is used to ensure that non-existent routes
 * display the 404 page without redirecting to the signin page.
 */
export function NoAuthRedirectProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    // Store the original push method
    const originalPush = router.push;
    
    // Override the router.push method to prevent redirects to signin
    // @ts-ignore - we're intentionally overriding the method
    router.push = (url: string, ...args: any[]) => {
      // If trying to redirect to signin, block it
      if (typeof url === 'string' && url.includes('/auth/signin')) {
        console.log('Prevented redirect to signin from special page');
        return Promise.resolve(false);
      }
      
      // Otherwise, allow the navigation
      return originalPush(url, ...args);
    };
    
    // Restore the original push method on cleanup
    return () => {
      // @ts-ignore - we're restoring the original method
      router.push = originalPush;
    };
  }, [router]);

  return <>{children}</>;
} 