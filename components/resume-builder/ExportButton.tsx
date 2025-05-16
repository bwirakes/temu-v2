'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface ExportButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

export default function ExportButton({ onClick, icon, label }: ExportButtonProps) {
  return (
    <Button 
      onClick={onClick}
      className="bg-blue-600 hover:bg-blue-700 shadow-md flex items-center gap-2"
    >
      {icon}
      <span>{label}</span>
    </Button>
  );
}