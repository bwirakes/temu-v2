import React from 'react';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      {children}
    </div>
  );
} 