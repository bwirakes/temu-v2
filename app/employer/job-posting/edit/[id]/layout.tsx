"use client";

import { Toaster } from "sonner";

export default function JobPostingEditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
} 