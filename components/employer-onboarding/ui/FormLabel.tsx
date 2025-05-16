"use client";

import React from "react";
import { Label as ShadcnLabel } from "@/components/ui/label";

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export function FormLabel({ children, ...props }: FormLabelProps) {
  return (
    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" {...props}>
      {children}
    </label>
  );
} 