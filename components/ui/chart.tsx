'use client';

// This is a placeholder implementation of the Chart component
// Replace with actual implementation once 'recharts' dependency is installed

import * as React from 'react';
import { cn } from '@/lib/utils';

// Basic placeholder chart config
export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    color?: string;
  };
};

// Placeholder chart component
const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    config: ChartConfig;
    children: React.ReactNode;
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`;

  return (
    <div
      data-chart={chartId}
      ref={ref}
      className={cn(
        "aspect-video border border-dashed border-gray-300 rounded-md p-4 flex flex-col items-center justify-center bg-gray-50",
        className
      )}
      {...props}
    >
      <div className="text-sm text-gray-500 text-center">
        Chart placeholder - recharts dependency required for full functionality
      </div>
      <div className="text-xs text-gray-400 mt-2">
        Install recharts to use this component
      </div>
    </div>
  );
});
ChartContainer.displayName = 'Chart';

// Placeholder tooltip
const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "border rounded-md bg-white p-2 shadow-md text-xs",
      className
    )}
    {...props}
  />
));
ChartTooltip.displayName = 'ChartTooltip';

// Placeholder area chart
const ChartArea = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "w-full h-full flex items-center justify-center",
      className
    )}
    {...props}
  >
    <div className="text-xs text-gray-400">Area Chart Placeholder</div>
  </div>
));
ChartArea.displayName = 'ChartArea';

// Placeholder bar chart
const ChartBar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "w-full h-full flex items-center justify-center",
      className
    )}
    {...props}
  >
    <div className="text-xs text-gray-400">Bar Chart Placeholder</div>
  </div>
));
ChartBar.displayName = 'ChartBar';

// Placeholder line chart
const ChartLine = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "w-full h-full flex items-center justify-center",
      className
    )}
    {...props}
  >
    <div className="text-xs text-gray-400">Line Chart Placeholder</div>
  </div>
));
ChartLine.displayName = 'ChartLine';

// Export components
export {
  ChartContainer as Chart,
  ChartTooltip,
  ChartArea,
  ChartBar,
  ChartLine,
};
