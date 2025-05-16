"use client";

import Link from "next/link";
import { 
  Briefcase, 
  FilePlus, 
  Users, 
  Building, 
  ChevronRight,
  Globe 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionButtonProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  primary?: boolean;
}

export default function ActionButton({ 
  title, 
  description, 
  icon, 
  href,
  primary = false 
}: ActionButtonProps) {
  const renderIcon = () => {
    const iconProps = { className: "h-5 w-5" };
    
    switch(icon) {
      case "Briefcase":
        return <Briefcase {...iconProps} />;
      case "FilePlus":
        return <FilePlus {...iconProps} />;
      case "Users":
        return <Users {...iconProps} />;
      case "Building":
        return <Building {...iconProps} />;
      case "Globe":
        return <Globe {...iconProps} />;
      default:
        return <FilePlus {...iconProps} />;
    }
  };

  return (
    <Link 
      href={href}
      className={cn(
        "flex items-start p-4 rounded-lg border transition-all duration-200 overflow-hidden relative",
        primary 
          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-700 hover:from-blue-700 hover:to-blue-800" 
          : "bg-white text-gray-800 border-gray-200 hover:border-blue-300 hover:shadow-md"
      )}
    >
      {primary && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/20 to-transparent rounded-bl-full -z-10"></div>
      )}
      
      <div className={cn(
        "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center",
        primary 
          ? "bg-blue-500/50" 
          : "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600"
      )}>
        {renderIcon()}
      </div>
      
      <div className="ml-4 flex-grow">
        <h3 className={cn(
          "font-medium text-base",
          primary ? "text-white" : "text-gray-800"
        )}>
          {title}
        </h3>
        <p className={cn(
          "text-sm mt-1", 
          primary ? "text-blue-100" : "text-muted-foreground"
        )}>
          {description}
        </p>
      </div>
      
      <ChevronRight className={cn(
        "flex-shrink-0 h-5 w-5 self-center",
        primary ? "text-blue-200" : "text-gray-400" 
      )} />
    </Link>
  );
}