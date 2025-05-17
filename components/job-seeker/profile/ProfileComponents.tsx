import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * A styled section card component for profile sections
 */
export function SectionCard({ 
  title, 
  children, 
  icon,
  action
}: { 
  title: string; 
  children: React.ReactNode; 
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b">
        <div className="flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          <h3 className="font-medium text-gray-900">{title}</h3>
        </div>
        {action && (
          <div>
            {action}
          </div>
        )}
      </div>
      <div className="p-4 divide-y divide-gray-100 space-y-3">
        {children}
      </div>
    </div>
  );
}

/**
 * A styled info item component for displaying profile information
 */
export function InfoItem({ 
  label, 
  value, 
  badge,
  children 
}: { 
  label: string; 
  value?: string | React.ReactNode; 
  badge?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="py-2">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">
        <div className="flex items-center gap-2">
          {value || children || "-"}
          {badge && (
            <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
      </dd>
    </div>
  );
}

/**
 * A styled status badge component for displaying status information
 */
export function StatusBadge({ 
  children, 
  variant = "default" 
}: { 
  children: React.ReactNode; 
  variant?: "default" | "success" | "warning" | "error" | "info" 
}) {
  const variantStyles = {
    default: "bg-gray-50 text-gray-700",
    success: "bg-green-50 text-green-700",
    warning: "bg-yellow-50 text-yellow-700",
    error: "bg-red-50 text-red-700",
    info: "bg-blue-50 text-blue-700",
  };

  return (
    <span className={`${variantStyles[variant]} text-xs px-2 py-1 rounded-full`}>
      {children}
    </span>
  );
}

/**
 * A styled empty state component for sections without data
 */
export function EmptyState({ 
  title, 
  description, 
  action 
}: { 
  title: string; 
  description: string; 
  action?: React.ReactNode 
}) {
  return (
    <div className="text-center py-8 px-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
      <h4 className="text-lg font-medium text-gray-700 mb-2">{title}</h4>
      <p className="text-gray-500 mb-4">{description}</p>
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}

/**
 * A styled card component for education and experience items
 */
export function ItemCard({ 
  title, 
  subtitle, 
  period, 
  location, 
  description, 
  tags,
  actions
}: { 
  title: string; 
  subtitle: string; 
  period?: string; 
  location?: string; 
  description?: string; 
  tags?: string[];
  actions?: React.ReactNode;
}) {
  return (
    <div className="p-4 bg-white border rounded-lg">
      <div className="flex justify-between">
        <div>
          <h4 className="font-medium text-gray-900">{title}</h4>
          <p className="text-gray-600">{subtitle}</p>
        </div>
        {actions && (
          <div>
            {actions}
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 mt-2">
        {period && (
          <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
            {period}
          </span>
        )}
        {location && (
          <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">
            {location}
          </span>
        )}
        {tags && tags.map((tag, idx) => (
          <span key={idx} className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded-full">
            {tag}
          </span>
        ))}
      </div>
      
      {description && (
        <p className="mt-2 text-sm text-gray-600">{description}</p>
      )}
    </div>
  );
} 