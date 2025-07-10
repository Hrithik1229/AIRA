import { AdvancedAnalytics } from "@/components/analytics/AdvancedAnalytics";

export default function Analytics() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="transform-gpu transition-all duration-500 hover:scale-105">
        <h1 className="text-3xl font-bold text-foreground mb-2 animate-tilt">Analytics & Insights</h1>
        <p className="text-muted-foreground">
          Deep insights into your mental wellness and productivity patterns 📊
        </p>
      </div>
      
      <AdvancedAnalytics />
    </div>
  );
} 