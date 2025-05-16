"use client";

import { ReactNode } from "react";
import EmployerProgressBar from "./EmployerProgressBar";

interface EmployerOnboardingLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
}

export default function EmployerOnboardingLayout({
  children,
  title,
  description,
}: EmployerOnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="pb-8 md:py-8 md:container md:mx-auto md:px-4 md:max-w-4xl">
        <div className="flex flex-col">
          <div className="order-2 md:order-1 w-full bg-white md:bg-transparent px-4 md:px-0">
            <EmployerProgressBar />
          </div>

          <div className="order-1 md:order-2 w-full md:mt-6">
            <div className="p-6 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white md:rounded-t-lg">
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="text-indigo-100 mt-1">{description}</p>
            </div>
          </div>

          <div className="order-3 md:order-3 w-full">
            <div className="bg-white p-4 md:p-6 md:rounded-b-lg md:shadow-lg">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 