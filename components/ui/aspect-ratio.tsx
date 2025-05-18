'use client';

// Temporarily replacing Radix UI implementation due to missing dependency
// This file can be replaced with the proper implementation after installing @radix-ui/react-aspect-ratio

import * as React from 'react';
import { cn } from '@/lib/utils';

interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: number;
}

// Create a simple implementation of aspect ratio
const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ className, ratio = 1, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          position: 'relative',
          width: '100%',
          paddingBottom: `${100 / ratio}%`,
          ...style,
        }}
        className={cn(className)}
        {...props}
      >
        {props.children && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            }}
          >
            {props.children}
          </div>
        )}
      </div>
    );
  }
);

AspectRatio.displayName = 'AspectRatio';

export { AspectRatio };
