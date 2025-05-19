"use client";

import { useMemo } from "react";
import { 
  Briefcase, 
  Users, 
  Calendar, 
  TrendingUp 
} from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  trend?: number;
  trendLabel?: string;
  icon: string;
}

export default function StatsCard({ 
  title, 
  value, 
  trend, 
  trendLabel,
  icon 
}: StatsCardProps) {
  const renderIcon = useMemo(() => {
    const iconProps = { className: "h-5 w-5 text-gray-500" };
    
    switch(icon) {
      case "Briefcase":
        return <Briefcase {...iconProps} />;
      case "Users":
        return <Users {...iconProps} />;
      case "Calendar":
        return <Calendar {...iconProps} />;
      case "TrendingUp":
        return <TrendingUp {...iconProps} />;
      default:
        return <Briefcase {...iconProps} />;
    }
  }, [icon]);

  return (
    <div className="bg-white p-6 rounded-md border border-gray-200 shadow-sm hover:shadow transition-all">
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-2 text-gray-800">{value}</h3>
        </div>
        <div className="h-9 w-9 flex items-center justify-center bg-gray-100 rounded-md">
          {renderIcon}
        </div>
      </div>
    </div>
  );
}