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
        </div>
      </div>

      <div className="md:container md:mx-auto md:px-4 md:max-w-3xl">
        <div className="order-3 md:order-3 w-full mt-[-2rem] md:mt-[-3rem] relative z-10">
          <div className="bg-white rounded-md shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-blue-600 p-6 text-white">
              <h2 className="text-xl font-medium text-white">{title}</h2>
              <p className="text-blue-100 mt-2 text-sm">{description}</p>
            </div>
            <div className="p-5 md:p-8">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 