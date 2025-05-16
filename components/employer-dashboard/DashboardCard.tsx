import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  children: ReactNode;
}

export default function DashboardCard({ title, children }: DashboardCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-blue-100 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full -z-10"></div>
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      {children}
    </div>
  );
}