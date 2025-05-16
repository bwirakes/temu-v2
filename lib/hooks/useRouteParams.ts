'use client';

import { useParams } from 'next/navigation';
import { use } from 'react';

/**
 * A custom hook to safely unwrap route params for both current and future Next.js versions.
 * In future versions of Next.js, `params` will be a Promise and must be unwrapped with `use()`.
 * This hook handles both the current version (where direct access is still allowed) and future versions.
 */
export function useRouteParams<T extends Record<string, string>>() {
  const params = useParams();
  
  // If params is a Promise (future Next.js versions), unwrap it with use()
  if (params && typeof params === 'object' && 'then' in params) {
    return use(params as unknown as Promise<T>);
  }
  
  // Otherwise, return params directly (current Next.js version)
  return params as T;
} 