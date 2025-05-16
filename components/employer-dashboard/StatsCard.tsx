"use client";

import { useMemo } from "react";
import { 
  ArrowUp, 
  ArrowDown, 
  Briefcase, 
  Users, 
  Calendar, 
  TrendingUp 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number | string;
  trend: number;
  trendLabel: string;
  icon: string;
}

export default function StatsCard({ 
  title, 
  value, 
  trend, 
  trendLabel,
  icon 
}: StatsCardProps) {
  const isPositive = trend > 0;
  const isNeutral = trend === 0;
  
  const renderIcon = useMemo(() => {
    const iconProps = { className: "h-5 w-5" };
    
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
    <div className="bg-white p-6 rounded-lg border border-blue-100 shadow-md hover:shadow-lg transition-shadow overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full -z-10"></div>
      
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-sm">
          {renderIcon}
        </div>
      </div>
      
      <div className="mt-4 flex items-center">
        <div
          className={cn(
            "flex items-center text-xs font-medium",
            isPositive && "text-green-600",
            isNeutral && "text-gray-500", 
            !isPositive && !isNeutral && "text-red-600"
          )}
        >
          {isPositive ? (
            <ArrowUp className="h-3 w-3 mr-1" />
          ) : isNeutral ? null : (
            <ArrowDown className="h-3 w-3 mr-1" />
          )}
          <span>{Math.abs(trend)}%</span>
        </div>
        <span className="text-xs text-muted-foreground ml-1">{trendLabel}</span>
      </div>
    </div>
  );
}