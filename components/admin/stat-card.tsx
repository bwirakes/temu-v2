import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  bgColor?: string;
  textColor?: string;
  iconColor?: string;
  loading?: boolean;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  bgColor = 'bg-blue-50',
  textColor = 'text-blue-800',
  iconColor = 'text-blue-500',
  loading = false
}: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
          {loading ? (
            <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <p className="text-2xl font-bold text-gray-800">
              {value.toLocaleString()}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${bgColor}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
} 
