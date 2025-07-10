import * as ProgressPrimitive from "@radix-ui/react-progress"
import * as React from "react"

import { cn } from "@/lib/utils"

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  variant?: "default" | "success" | "warning" | "danger" | "gradient"
  size?: "sm" | "default" | "lg"
  animated?: boolean
  showLabel?: boolean
  label?: string
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant = "default", size = "default", animated = false, showLabel = false, label, ...props }, ref) => {
  const progressVariants = {
    default: "bg-primary",
    success: "bg-success",
    warning: "bg-warning", 
    danger: "bg-destructive",
    gradient: "bg-gradient-to-r from-primary to-purple-600",
  }

  const sizeVariants = {
    sm: "h-1.5",
    default: "h-2",
    lg: "h-3",
  }

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground">
            {label || "Progress"}
          </span>
          {showLabel && (
            <span className="text-sm text-muted-foreground">
              {Math.round(value || 0)}%
            </span>
          )}
        </div>
      )}
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-full bg-secondary",
          sizeVariants[size],
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full w-full flex-1 transition-all duration-500 ease-in-out",
            progressVariants[variant],
            animated && "animate-pulse",
            variant === "gradient" && "animate-gradient-x"
          )}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </ProgressPrimitive.Root>
    </div>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }

