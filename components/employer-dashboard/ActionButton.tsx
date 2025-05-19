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
    const iconProps = { 
      className: cn(
        "h-5 w-5",
        primary ? "text-white" : "text-gray-500"
      )
    };
    
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
        "flex items-start p-5 rounded-md border shadow-sm transition-all duration-150 group",
        primary 
          ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:shadow" 
          : "bg-white text-gray-800 border-gray-200 hover:border-gray-300 hover:shadow"
      )}
    >
      <div className={cn(
        "flex-shrink-0 h-9 w-9 rounded-md flex items-center justify-center",
        primary 
          ? "bg-blue-700" 
          : "bg-gray-100 group-hover:bg-gray-200 transition-colors"
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
          primary ? "text-blue-100" : "text-gray-500"
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