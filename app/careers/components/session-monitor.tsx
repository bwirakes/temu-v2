'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

/**
 * A component to monitor session API calls
 * This is used for debugging purposes only
 */
export default function SessionMonitor() {
  const { status } = useSession();
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
    console.log(`SessionMonitor: Session status is "${status}" (render #${renderCount.current})`);
    
    // This will help identify if we're making duplicate session calls
    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input instanceof Request ? input.url : '';
      
      if (url.includes('/api/auth/session')) {
        console.log(`SessionMonitor: Fetch request to ${url}`);
      }
      
      return originalFetch.apply(this, [input, init as any]);
    };
    
    return () => {
      // Restore original fetch
      window.fetch = originalFetch;
    };
  }, [status]);
  
  // This component doesn't render anything
  return null;
} 