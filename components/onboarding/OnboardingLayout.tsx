"use client";

import { ReactNode } from "react";
import ProgressBar from "./ProgressBar";
import OnboardingLoader from "./OnboardingLoader";

interface OnboardingLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  currentStep?: number;
}

export default function OnboardingLayout({
  children,
  title,
  description,
  currentStep,
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <OnboardingLoader />
      <div className="flex-grow pb-8 md:py-8 md:container md:mx-auto md:px-4 md:max-w-4xl">
        <div className="flex flex-col h-full">
          <div className="order-2 md:order-1 w-full bg-white md:bg-transparent px-4 md:px-0">
            <ProgressBar forceCurrentStep={currentStep} />
          </div>

          <div className="order-1 md:order-2 w-full md:mt-6">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white md:rounded-t-lg">
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="text-blue-100 mt-1">{description}</p>
            </div>
          </div>

          <div className="order-3 md:order-3 w-full flex-grow">
            <div className="bg-white p-4 md:p-6 md:rounded-b-lg md:shadow-lg min-h-[calc(100vh-200px)] md:min-h-0 flex flex-col">
              <div className="flex-grow">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 