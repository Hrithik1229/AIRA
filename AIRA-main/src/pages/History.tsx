import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { historyService, type HistoryEntry } from "@/services/history-service";
import { differenceInDays, format, isToday, isYesterday } from "date-fns";
import { Calendar, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function History() {
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load history data from history service
  useEffect(() => {
    const loadHistoryData = () => {
      try {
        const history = historyService.getHistory();
        setHistoryData(history);
      } catch (error) {
        console.error('Error loading history data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistoryData();
  }, []);

  // Calculate summary statistics
  const totalTasksCompleted = historyData.reduce((sum, day) => sum + day.tasksCompleted, 0);
  const totalTasks = historyData.reduce((sum, day) => sum + day.tasksTotal, 0);
  const daysTracked = historyData.length;
  const completionRate = totalTasks > 0 ? (totalTasksCompleted / totalTasks) * 100 : 0;

  // Get most common mood
  const getMostCommonMood = () => {
    const moodCounts: { [key: string]: number } = {};
    historyData.forEach(day => {
      if (day.mood) {
        const moodKey = day.mood.label;
        moodCounts[moodKey] = (moodCounts[moodKey] || 0) + 1;
      }
    });
    
    const mostCommon = Object.entries(moodCounts).sort(([,a], [,b]) => b - a)[0];
    return mostCommon ? { label: mostCommon[0], count: mostCommon[1] } : null;
  };

  const mostCommonMood = getMostCommonMood();

  // Get relative date string
  const getRelativeDate = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    const daysDiff = differenceInDays(new Date(), date);
    if (daysDiff === 1) return "2 days ago";
    if (daysDiff === 2) return "3 days ago";
    return format(date, "MMM d");
  };

  // Generate insights based on actual data
  const generateInsights = () => {
    const insights = [];
    
    if (historyData.length === 0) {
      insights.push({
        icon: "📝",
        text: "Start tracking your tasks and mood to see your progress history here!",
        color: "text-primary"
      });
      return insights;
    }

    // Task completion insight
    if (completionRate >= 80) {
      insights.push({
        icon: "✨",
        text: `Excellent work! You're completing ${Math.round(completionRate)}% of your tasks.`,
        color: "text-success"
      });
    } else if (completionRate >= 60) {
      insights.push({
        icon: "🎯",
        text: `Good progress! You're completing ${Math.round(completionRate)}% of your tasks.`,
        color: "text-primary"
      });
    } else {
      insights.push({
        icon: "💪",
        text: `You've completed ${totalTasksCompleted} tasks. Keep going!`,
        color: "text-warning"
      });
    }

    // Mood pattern insight
    if (mostCommonMood) {
      insights.push({
        icon: "🧘‍♀️",
        text: `Your most common mood is ${mostCommonMood.label} (${mostCommonMood.count} days).`,
        color: "text-primary"
      });
    }

    // Streak insight
    if (daysTracked >= 3) {
      insights.push({
        icon: "🔥",
        text: `You've been tracking for ${daysTracked} days! Consistency is key.`,
        color: "text-success"
      });
    }

    return insights;
  };

  const insights = generateInsights();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="transform-gpu transition-all duration-500 hover:scale-105">
          <h1 className="text-3xl font-bold text-foreground mb-2 animate-tilt">Your Journey</h1>
          <p className="text-muted-foreground">
            Track your progress, patterns, and celebrate your wins 📈
          </p>
        </div>
        
        <Card className="border-none shadow-md">
          <CardContent className="p-12 text-center">
            <div className="animate-pulse">
              <div className="text-2xl mb-4">📊</div>
              <p className="text-muted-foreground">Loading your history...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="transform-gpu transition-all duration-500 hover:scale-105">
        <h1 className="text-3xl font-bold text-foreground mb-2 animate-tilt">Your Journey</h1>
        <p className="text-muted-foreground">
          Track your progress, patterns, and celebrate your wins 📈
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-md bg-gradient-to-br from-success to-accent transition-all duration-300 hover:animate-card-3d hover:shadow-xl transform-gpu perspective-1000 animate-float">
          <CardContent className="p-4 flex flex-col items-center">
            <AnimatedCounter value={totalTasksCompleted} className="text-2xl text-success-foreground" />
            <p className="text-sm text-success-foreground">Tasks Completed</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md bg-gradient-to-br from-primary-soft to-primary-glow transition-all duration-300 hover:animate-card-3d hover:shadow-xl transform-gpu perspective-1000 animate-tilt">
          <CardContent className="p-4 flex flex-col items-center">
            <AnimatedCounter value={daysTracked} className="text-2xl text-primary" />
            <p className="text-sm text-primary-foreground">Days Tracked</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md bg-gradient-to-br from-mood-happy to-mood-calm transition-all duration-300 hover:animate-card-3d hover:shadow-xl transform-gpu perspective-1000 animate-float" style={{ animationDelay: '2s' }}>
          <CardContent className="p-4 flex flex-col items-center">
            {mostCommonMood ? (
              <>
                <div className="text-2xl font-bold text-foreground">
                  {historyData.find(day => day.mood?.label === mostCommonMood.label)?.mood?.emoji || "😊"}
                </div>
                <p className="text-sm text-foreground">{mostCommonMood.label}</p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">📊</div>
                <p className="text-sm text-foreground">No mood data</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily History */}
      {historyData.length > 0 ? (
        <div className="space-y-4">
          {historyData.map((day, index) => (
            <Card key={index} className="border-none shadow-md transition-all duration-300 hover:animate-card-3d hover:shadow-xl transform-gpu perspective-1000 hover:scale-[1.02]">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {day.mood ? (
                      <span className="text-2xl animate-float" style={{ animationDelay: `${index * 0.5}s` }}>{day.mood.emoji}</span>
                    ) : (
                      <Calendar className="w-6 h-6 text-muted-foreground" />
                    )}
                    <div>
                      <span className="text-lg">{getRelativeDate(day.date)}</span>
                      {day.mood && (
                        <Badge variant="outline" className="ml-2">
                          {day.mood.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Tasks</div>
                    <div className="font-semibold text-primary">
                      {day.tasksCompleted}/{day.tasksTotal}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {day.highlights.length > 0 && (
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Highlights</h4>
                      <div className="space-y-2">
                        {day.highlights.map((highlight, idx) => (
                          <div 
                            key={idx}
                            className="flex items-start gap-2 text-sm text-muted-foreground transition-transform duration-200 hover:translate-x-2"
                          >
                            <span className="text-primary mt-1">•</span>
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Progress Bar */}
                  {day.tasksTotal > 0 && (
                    <div>
                      <div className="flex justify-between text-sm text-muted-foreground mb-1">
                        <span>Task Progress</span>
                        <span>
                          <AnimatedCounter value={Math.round((day.tasksCompleted / day.tasksTotal) * 100)} suffix="%" />
                        </span>
                      </div>
                      <div className="flex justify-center py-2">
                        <ProgressRing progress={(day.tasksCompleted / day.tasksTotal) * 100} size={48} strokeWidth={5} showLabel={false} />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-none shadow-md">
          <CardContent className="text-center py-12">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No history yet</h3>
            <p className="text-muted-foreground">
              Start using the app to track your tasks and mood. Your progress will appear here!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      <Card className="border-none shadow-md bg-gradient-to-br from-secondary to-accent transition-all duration-300 hover:animate-card-3d hover:shadow-xl transform-gpu perspective-1000 animate-tilt">
        <CardHeader>
          <CardTitle className="text-lg animate-float flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Insights 💡
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 transition-transform duration-200 hover:translate-x-2">
                <span className={`text-lg animate-float ${insight.color}`} style={{ animationDelay: `${index + 1}s` }}>
                  {insight.icon}
                </span>
                <p className="text-sm text-secondary-foreground">
                  {insight.text}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}