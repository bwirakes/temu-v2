'use client';

// Temporarily replacing Radix UI implementation due to missing dependency
// This file can be replaced with the proper implementation after installing @radix-ui/react-avatar

import * as React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
        className
      )}
      {...props}
    />
  )
);
Avatar.displayName = 'Avatar';

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  onLoadingStatusChange?: (status: 'loading' | 'loaded' | 'error') => void;
}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, onLoadingStatusChange, ...props }, ref) => {
    const [status, setStatus] = React.useState<'loading' | 'loaded' | 'error'>(
      'loading'
    );

    React.useEffect(() => {
      if (onLoadingStatusChange) {
        onLoadingStatusChange(status);
      }
    }, [onLoadingStatusChange, status]);

    const { width, height, src, ...restProps } = props;

    return (
      <Image
        ref={ref}
        className={cn('aspect-square h-full w-full', className)}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        alt={props.alt || ''}
        src={typeof src === 'string' ? src : 'https://placehold.co/40x40'}
        width={typeof width === 'number' ? width : (typeof width === 'string' ? parseInt(width, 10) || 40 : 40)}
        height={typeof height === 'number' ? height : (typeof height === 'string' ? parseInt(height, 10) || 40 : 40)}
        priority={false}
        loading="lazy"
        {...restProps}
      />
    );
  }
);
AvatarImage.displayName = 'AvatarImage';

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {}

const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-muted',
        className
      )}
      {...props}
    />
  )
);
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback };
