'use client';

import { useEffect } from 'react';

export default function ClientScript() {
  useEffect(() => {
    // Add any client-side functionality here if needed
    // The job preview functionality has been removed as we're now directing users to the employer page
    
    console.log('Halaman karir telah dimuat');
    
  }, []);
  
  // This component doesn't render anything directly
  return null;
} 