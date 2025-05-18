'use client';

import Image from 'next/image';
import { useState } from 'react';

interface AboutImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
}

export default function AboutImage({ 
  src, 
  alt, 
}: AboutImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  
  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, 1200px"
      className="object-cover"
      priority
      onError={() => {

      }}
    />
  );
} 