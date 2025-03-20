import * as React from "react";
import { cn } from "../../lib/utils";

const Chart = React.forwardRef(({ className, ...props }, ref) => {
  return <div className={cn("relative", className)} ref={ref} {...props} />;
});
Chart.displayName = "Chart";

const ChartContainer = React.forwardRef(
  ({ className, ...props }, ref) => {
    return <div className={cn("relative", className)} ref={ref} {...props} />;
  }
);
ChartContainer.displayName = "ChartContainer";

const ChartTooltip = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn(
          "absolute z-50 rounded-md border bg-popover p-4 text-popover-foreground shadow-sm animate-in fade-in-50 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
ChartTooltip.displayName = "ChartTooltip";

const ChartTooltipContent = React.forwardRef(
  ({ className, ...props }, ref) => {
    return <div className={cn("flex flex-col gap-1", className)} ref={ref} {...props} />;
  }
);
ChartTooltipContent.displayName = "ChartTooltipContent";

const ChartTooltipItem = React.forwardRef(
  ({ className, label, value, color, ...props }, ref) => {
    return (
      <div className={cn("flex items-center justify-between text-sm", className)} ref={ref} {...props}>
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
    );
  }
);
ChartTooltipItem.displayName = "ChartTooltipItem";

const ChartLegend = React.forwardRef(
  ({ className, ...props }, ref) => {
    return <div className={cn("flex items-center justify-center pt-4", className)} ref={ref} {...props} />;
  }
);
ChartLegend.displayName = "ChartLegend";

// Export all components
export { Chart, ChartContainer, ChartTooltip, ChartTooltipContent, ChartTooltipItem, ChartLegend }; 