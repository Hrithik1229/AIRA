import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface LoadingSpinnerProps {
  size?: "sm" | "default" | "lg" | "xl";
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  text?: string;
  className?: string;
}

export function LoadingSpinner({ 
  size = "default", 
  variant = "default", 
  text,
  className 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-6 h-6", 
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  };

  const variantClasses = {
    default: "text-muted-foreground",
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    danger: "text-destructive"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <Loader2 
        className={cn(
          "animate-spin",
          sizeClasses[size],
          variantClasses[variant]
        )} 
      />
      {text && (
        <p className={cn(
          "text-sm text-muted-foreground animate-pulse",
          size === "xl" && "text-base"
        )}>
          {text}
        </p>
      )}
    </div>
  );
}

// Alternative spinner with dots
export function LoadingDots({ 
  size = "default",
  className 
}: { 
  size?: "sm" | "default" | "lg"
  className?: string 
}) {
  const sizeClasses = {
    sm: "w-1 h-1",
    default: "w-2 h-2",
    lg: "w-3 h-3"
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className={cn(
        "bg-primary rounded-full animate-bounce",
        sizeClasses[size]
      )} style={{ animationDelay: "0ms" }} />
      <div className={cn(
        "bg-primary rounded-full animate-bounce",
        sizeClasses[size]
      )} style={{ animationDelay: "150ms" }} />
      <div className={cn(
        "bg-primary rounded-full animate-bounce",
        sizeClasses[size]
      )} style={{ animationDelay: "300ms" }} />
    </div>
  );
}

// Pulse spinner
export function LoadingPulse({ 
  size = "default",
  className 
}: { 
  size?: "sm" | "default" | "lg"
  className?: string 
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-6 h-6",
    lg: "w-8 h-8"
  };

  return (
    <div className={cn(
      "rounded-full bg-primary animate-pulse",
      sizeClasses[size],
      className
    )} />
  );
}

// Ring spinner
export function LoadingRing({ 
  size = "default",
  className 
}: { 
  size?: "sm" | "default" | "lg"
  className?: string 
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-6 h-6",
    lg: "w-8 h-8"
  };

  return (
    <div className={cn(
      "border-2 border-muted border-t-primary rounded-full animate-spin",
      sizeClasses[size],
      className
    )} />
  );
} 