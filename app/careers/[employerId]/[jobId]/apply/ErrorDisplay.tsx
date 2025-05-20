'use client';

import { Button } from '@/components/ui/button';

interface ErrorDisplayProps {
  errorMessage: string;
}

export default function ErrorDisplay({ errorMessage }: ErrorDisplayProps) {
  return (
    <div className="space-y-4 w-full">
      <p className="text-red-600 text-sm">{errorMessage}</p>
      <Button 
        onClick={() => window.location.reload()} 
        className="w-full"
      >
        Coba Lagi
      </Button>
    </div>
  );
} 