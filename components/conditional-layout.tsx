'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface ConditionalLayoutProps {
  children: ReactNode;
  header: ReactNode;
  footer: ReactNode;
}

/**
 * A component that conditionally renders header and footer based on the current path
 * Used to exclude specific layouts (like headers/footers) from certain pages
 */
export default function ConditionalLayout({ 
  children, 
  header, 
  footer 
}: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Pages that should not display the standard header/footer
  const excludeHeaderFooterPaths = [
    '/admin',
    '/admin/',
  ];
  
  // Check if current path starts with any path that should exclude header/footer
  const shouldExcludeHeaderFooter = 
    // Exact match for specified paths
    excludeHeaderFooterPaths.includes(pathname) || 
    // Or starts with '/admin/' followed by additional segments
    pathname.startsWith('/admin/');
  
  if (shouldExcludeHeaderFooter) {
    return <>{children}</>;
  }
  
  return (
    <>
      {header}
      {children}
      {footer}
    </>
  );
} 