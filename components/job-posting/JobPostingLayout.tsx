"use client";

import { ReactNode } from "react";
import ProgressBar from "./ProgressBar";

interface JobPostingLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
}

export default function JobPostingLayout({
  children,
  title,
  description,
}: JobPostingLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pb-8 md:py-12 md:container md:mx-auto md:px-4 md:max-w-3xl">
        <div className="flex flex-col">
          <div className="order-2 md:order-1 w-full px-4 md:px-0 mb-4">
            <ProgressBar />
          </div>

          <div className="order-1 md:order-2 w-full">
            <div className="p-6 bg-white border-b border-gray-200 text-gray-800 md:rounded-t-md">
              <h2 className="text-xl font-medium text-gray-900">{title}</h2>
              <p className="text-gray-600 mt-2 text-sm">{description}</p>
            </div>
          </div>

          <div className="order-3 md:order-3 w-full">
            <div className="bg-white p-5 md:p-8 md:rounded-b-md border-t border-gray-100">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 