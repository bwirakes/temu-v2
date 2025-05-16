'use client';

import { useState } from 'react';
import Image from 'next/image';

interface EmployerLogoProps {
  logoUrl: string | null;
  companyName: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function EmployerLogo({ logoUrl, companyName, size = 'sm' }: EmployerLogoProps) {
  const [hasError, setHasError] = useState(false);
  
  // Determine size classes based on the size prop
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-20 h-20",
    lg: "w-24 h-24"
  };
  
  const fontSizeClasses = {
    sm: "text-xl",
    md: "text-xl",
    lg: "text-2xl"
  };
  
  // Check if the logo URL is from ui-avatars.com
  const isUiAvatars = logoUrl && logoUrl.includes('ui-avatars.com');
  
  // Check if the logoUrl is from other allowed domains
  const isNextImageAllowed = logoUrl && !hasError && !isUiAvatars && 
    (logoUrl.startsWith('/') || // Local image
     logoUrl.startsWith('https://avatars.githubusercontent.com') ||
     logoUrl.startsWith('https://images.unsplash.com') ||
     logoUrl.startsWith('https://via.placeholder.com'));
  
  // If it's a UI Avatars URL, use a regular img tag
  if (isUiAvatars && !hasError) {
    return (
      <div className={`${sizeClasses[size]} relative flex-shrink-0`}>
        <img
          src={logoUrl}
          alt={companyName}
          className="w-full h-full object-contain rounded-md"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }
  
  // If logo URL is valid for Next.js Image, use that
  if (isNextImageAllowed) {
    return (
      <div className={`${sizeClasses[size]} relative flex-shrink-0`}>
        <Image
          src={logoUrl}
          alt={companyName}
          fill
          sizes={`(max-width: 768px) ${size === 'sm' ? '64px' : size === 'md' ? '80px' : '96px'}, ${size === 'sm' ? '64px' : size === 'md' ? '80px' : '96px'}`}
          className="object-contain rounded-md"
          onError={() => setHasError(true)}
        />
      </div>
    );
  } 
  
  // Otherwise show the fallback with initials
  return (
    <div className={`${sizeClasses[size]} bg-blue-50 rounded-md flex items-center justify-center flex-shrink-0`}>
      <span className={`${fontSizeClasses[size]} font-bold text-blue-600`}>
        {companyName.substring(0, 2).toUpperCase()}
      </span>
    </div>
  );
} 