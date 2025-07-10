import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  variant?: "default" | "minimal" | "animated" | "hero";
  className?: string;
}

export function Logo({ size = "md", variant = "default", className }: LogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-20 h-20",
    hero: "w-32 h-32"
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
    hero: "text-5xl"
  };

  if (variant === "hero") {
    return (
      <div className={cn("flex flex-col items-center gap-4", className)}>
        <div className={cn(
          "relative rounded-2xl bg-gradient-to-br from-primary via-purple-600 to-pink-600 p-6 shadow-2xl overflow-hidden",
          sizeClasses[size]
        )}>
          {/* Hero AI Brain */}
          <div className="w-full h-full relative">
            {/* Central neural network with enhanced glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full animate-ping shadow-[0_0_20px_rgba(255,255,255,0.8)]"></div>
            </div>
            
            {/* Large orbiting nodes */}
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-bounce shadow-[0_0_10px_rgba(255,255,255,0.6)]" style={{ animationDelay: '0s' }}></div>
            <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-white rounded-full animate-bounce shadow-[0_0_10px_rgba(255,255,255,0.6)]" style={{ animationDelay: '0.2s' }}></div>
            <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-bounce shadow-[0_0_10px_rgba(255,255,255,0.6)]" style={{ animationDelay: '0.4s' }}></div>
            <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-white rounded-full animate-bounce shadow-[0_0_10px_rgba(255,255,255,0.6)]" style={{ animationDelay: '0.6s' }}></div>
            
            {/* Enhanced connection lines */}
            <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
            <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
            <div className="absolute top-1/4 left-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
            <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
            
            {/* Additional neural connections */}
            <div className="absolute top-1/3 left-1/3 w-0.5 h-0.5 bg-white/80 rounded-full"></div>
            <div className="absolute top-2/3 right-1/3 w-0.5 h-0.5 bg-white/80 rounded-full"></div>
            <div className="absolute top-1/3 right-1/3 w-0.5 h-0.5 bg-white/60 rounded-full"></div>
            <div className="absolute top-2/3 left-1/3 w-0.5 h-0.5 bg-white/60 rounded-full"></div>
          </div>
          
          {/* Multiple rotating gradient overlays */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent via-white/15 to-transparent animate-spin" style={{ animationDuration: '4s' }}></div>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent via-white/10 to-transparent animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}></div>
          
          {/* Multiple pulse rings */}
          <div className="absolute inset-0 rounded-2xl border-2 border-white/30 animate-ping"></div>
          <div className="absolute inset-0 rounded-2xl border border-white/20 animate-ping" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute inset-0 rounded-2xl border border-white/10 animate-ping" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="flex flex-col items-center">
          <span className={cn("font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent", textSizes[size])}>
            AIRA
          </span>
          <span className="text-lg text-muted-foreground font-medium">AI Assistant</span>
        </div>
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className={cn(
          "relative rounded-xl bg-gradient-to-br from-primary via-purple-600 to-pink-600 p-2 shadow-lg",
          sizeClasses[size]
        )}>
          {/* AI Brain Circuit Pattern */}
          <div className="w-full h-full relative">
            {/* Central node */}
            <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            
            {/* Circuit lines */}
            <div className="absolute top-1/4 left-1/4 w-0.5 h-0.5 bg-white rounded-full"></div>
            <div className="absolute top-1/4 right-1/4 w-0.5 h-0.5 bg-white rounded-full"></div>
            <div className="absolute bottom-1/4 left-1/4 w-0.5 h-0.5 bg-white rounded-full"></div>
            <div className="absolute bottom-1/4 right-1/4 w-0.5 h-0.5 bg-white rounded-full"></div>
            
            {/* Connection lines */}
            <div className="absolute top-1/2 left-1/4 w-0.5 h-0.5 bg-white rounded-full"></div>
            <div className="absolute top-1/2 right-1/4 w-0.5 h-0.5 bg-white rounded-full"></div>
            <div className="absolute top-1/4 left-1/2 w-0.5 h-0.5 bg-white rounded-full"></div>
            <div className="absolute bottom-1/4 left-1/2 w-0.5 h-0.5 bg-white rounded-full"></div>
          </div>
          
          {/* Pulse effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>
        </div>
        <span className={cn("font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent", textSizes[size])}>
          AIRA
        </span>
      </div>
    );
  }

  if (variant === "animated") {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className={cn(
          "relative rounded-xl bg-gradient-to-br from-primary via-purple-600 to-pink-600 p-3 shadow-lg overflow-hidden",
          sizeClasses[size]
        )}>
          {/* Animated AI Brain */}
          <div className="w-full h-full relative">
            {/* Central neural network */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
            </div>
            
            {/* Orbiting nodes */}
            <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="absolute bottom-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.6s' }}></div>
            
            {/* Connection lines with glow */}
            <div className="absolute top-1/2 left-1/4 w-0.5 h-0.5 bg-white rounded-full shadow-[0_0_4px_rgba(255,255,255,0.8)]"></div>
            <div className="absolute top-1/2 right-1/4 w-0.5 h-0.5 bg-white rounded-full shadow-[0_0_4px_rgba(255,255,255,0.8)]"></div>
            <div className="absolute top-1/4 left-1/2 w-0.5 h-0.5 bg-white rounded-full shadow-[0_0_4px_rgba(255,255,255,0.8)]"></div>
            <div className="absolute bottom-1/4 left-1/2 w-0.5 h-0.5 bg-white rounded-full shadow-[0_0_4px_rgba(255,255,255,0.8)]"></div>
          </div>
          
          {/* Rotating gradient overlay */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent via-white/10 to-transparent animate-spin" style={{ animationDuration: '3s' }}></div>
          
          {/* Pulse rings */}
          <div className="absolute inset-0 rounded-xl border border-white/20 animate-ping"></div>
          <div className="absolute inset-0 rounded-xl border border-white/10 animate-ping" style={{ animationDelay: '0.5s' }}></div>
        </div>
        
        <div className="flex flex-col">
          <span className={cn("font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent", textSizes[size])}>
            AIRA
          </span>
          <span className="text-xs text-muted-foreground font-medium">AI Assistant</span>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn(
        "relative rounded-xl bg-gradient-to-br from-primary via-purple-600 to-pink-600 p-3 shadow-lg",
        sizeClasses[size]
      )}>
        {/* AI Brain Icon */}
        <div className="w-full h-full relative">
          {/* Central processing unit */}
          <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg"></div>
          
          {/* Neural network nodes */}
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute bottom-1/4 left-1/4 w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-white rounded-full"></div>
          
          {/* Connection nodes */}
          <div className="absolute top-1/2 left-1/4 w-0.5 h-0.5 bg-white rounded-full"></div>
          <div className="absolute top-1/2 right-1/4 w-0.5 h-0.5 bg-white rounded-full"></div>
          <div className="absolute top-1/4 left-1/2 w-0.5 h-0.5 bg-white rounded-full"></div>
          <div className="absolute bottom-1/4 left-1/2 w-0.5 h-0.5 bg-white rounded-full"></div>
          
          {/* Data flow lines */}
          <div className="absolute top-1/3 left-1/3 w-0.5 h-0.5 bg-white/60 rounded-full"></div>
          <div className="absolute top-2/3 right-1/3 w-0.5 h-0.5 bg-white/60 rounded-full"></div>
        </div>
        
        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 via-transparent to-white/5"></div>
      </div>
      
      <div className="flex flex-col">
        <span className={cn("font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent", textSizes[size])}>
          AIRA
        </span>
        <span className="text-xs text-muted-foreground font-medium">AI Assistant</span>
      </div>
    </div>
  );
} 