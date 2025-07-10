import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { historyService, type HistoryEntry } from "@/services/history-service";
import {
    BarChart3,
    TrendingUp
} from "lucide-react";
import { useEffect, useState } from "react";

interface AnalyticsData {
  moodTrends: MoodTrend[];
  productivityInsights: ProductivityInsight[];
  wellnessScore: number;
  recommendations: Recommendation[];
  patterns: Pattern[];
}

interface MoodTrend {
  date: string;
  mood: string;
  score: number;
  emoji: string;
}

interface ProductivityInsight {
  type: 'positive' | 'negative' | 'neutral';
  title: string;
  description: string;
  impact: number;
  icon: string;
}

interface Recommendation {
  type: 'mood' | 'productivity' | 'wellness';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
}

interface Pattern {
  type: string;
  description: string;
  confidence: number;
  trend: 'improving' | 'declining' | 'stable';
}

export function AdvancedAnalytics() {
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    moodTrends: [],
    productivityInsights: [],
    wellnessScore: 0,
    recommendations: [],
    patterns: []
  });

  // Load history data
  useEffect(() => {
    const data = historyService.getHistory();
    setHistoryData(data);
  }, []);

  // Calculate analytics when data or time range changes
  useEffect(() => {
    if (historyData.length > 0) {
      const calculatedData = calculateAnalytics(historyData, timeRange);
      setAnalyticsData(calculatedData);
    }
  }, [historyData, timeRange]);

  const calculateAnalytics = (data: HistoryEntry[], range: string): AnalyticsData => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const filteredData = data.slice(-days);
    
    // Calculate mood trends
    const moodTrends: MoodTrend[] = filteredData.map(entry => ({
      date: new Date(entry.date).toLocaleDateString(),
      mood: entry.mood?.label || 'Unknown',
      score: getMoodScore(entry.mood?.label || ''),
      emoji: entry.mood?.emoji || '😐'
    }));

    // Calculate productivity insights
    const productivityInsights = calculateProductivityInsights(filteredData);

    // Calculate wellness score
    const wellnessScore = calculateWellnessScore(filteredData);

    // Generate recommendations
    const recommendations = generateRecommendations(filteredData, wellnessScore);

    // Identify patterns
    const patterns = identifyPatterns(filteredData);

    return {
      moodTrends,
      productivityInsights,
      wellnessScore,
      recommendations,
      patterns
    };
  };

  const getMoodScore = (mood: string): number => {
    const moodScores: { [key: string]: number } = {
      'Happy': 9, 'Excited': 9, 'Grateful': 8, 'Calm': 7, 'Content': 6,
      'Mixed': 5, 'Tired': 4, 'Stressed': 3, 'Sad': 2, 'Anxious': 2,
      'Angry': 1, 'Depressed': 1, 'Crisis': 0
    };
    return moodScores[mood] || 5;
  };

  const calculateProductivityInsights = (data: HistoryEntry[]): ProductivityInsight[] => {
    const insights: ProductivityInsight[] = [];
    
    // Calculate average completion rate
    const totalTasks = data.reduce((sum, day) => sum + day.tasksTotal, 0);
    const completedTasks = data.reduce((sum, day) => sum + day.tasksCompleted, 0);
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    if (completionRate >= 80) {
      insights.push({
        type: 'positive',
        title: 'Excellent Task Completion',
        description: `You're completing ${Math.round(completionRate)}% of your tasks consistently.`,
        impact: 9,
        icon: '🎯'
      });
    } else if (completionRate >= 60) {
      insights.push({
        type: 'positive',
        title: 'Good Progress',
        description: `You're completing ${Math.round(completionRate)}% of your tasks. Keep it up!`,
        impact: 7,
        icon: '📈'
      });
    } else {
      insights.push({
        type: 'negative',
        title: 'Task Completion Needs Improvement',
        description: `You're completing ${Math.round(completionRate)}% of your tasks. Consider breaking tasks into smaller steps.`,
        impact: 4,
        icon: '⚠️'
      });
    }

    // Check for consistency
    const activeDays = data.filter(day => day.tasksTotal > 0).length;
    const consistencyRate = (activeDays / data.length) * 100;

    if (consistencyRate >= 80) {
      insights.push({
        type: 'positive',
        title: 'High Consistency',
        description: 'You\'re setting tasks regularly. This builds great habits!',
        impact: 8,
        icon: '🔥'
      });
    } else {
      insights.push({
        type: 'neutral',
        title: 'Inconsistent Task Setting',
        description: 'Try to set at least one task daily to build momentum.',
        impact: 5,
        icon: '📅'
      });
    }

    return insights;
  };

  const calculateWellnessScore = (data: HistoryEntry[]): number => {
    let score = 50; // Base score
    
    // Mood factor (40% weight)
    const moodScores = data.map(day => getMoodScore(day.mood?.label || ''));
    const avgMoodScore = moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length;
    score += (avgMoodScore - 5) * 4; // Scale mood impact
    
    // Productivity factor (30% weight)
    const totalTasks = data.reduce((sum, day) => sum + day.tasksTotal, 0);
    const completedTasks = data.reduce((sum, day) => sum + day.tasksCompleted, 0);
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    score += (completionRate - 50) * 0.3; // Scale productivity impact
    
    // Consistency factor (30% weight)
    const activeDays = data.filter(day => day.tasksTotal > 0 || day.mood).length;
    const consistencyRate = (activeDays / data.length) * 100;
    score += (consistencyRate - 50) * 0.3; // Scale consistency impact
    
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const generateRecommendations = (data: HistoryEntry[], wellnessScore: number): Recommendation[] => {
    const recommendations: Recommendation[] = [];
    
    // Mood-based recommendations
    const recentMoods = data.slice(-3).map(day => day.mood?.label).filter(Boolean);
    const mostCommonMood = recentMoods.sort((a, b) => 
      recentMoods.filter(v => v === a).length - recentMoods.filter(v => v === b).length
    ).pop();

    if (mostCommonMood === 'Stressed' || mostCommonMood === 'Anxious') {
      recommendations.push({
        type: 'wellness',
        title: 'Practice Stress Management',
        description: 'Your recent mood suggests you might be experiencing stress. Consider meditation or breathing exercises.',
        priority: 'high',
        action: 'Try the breathing timer in the Wellness section'
      });
    }

    if (mostCommonMood === 'Sad' || mostCommonMood === 'Depressed') {
      recommendations.push({
        type: 'wellness',
        title: 'Seek Support',
        description: 'If you\'re feeling consistently low, consider reaching out to a mental health professional.',
        priority: 'high',
        action: 'Talk to the AI chatbot about your feelings'
      });
    }

    // Productivity recommendations
    const avgTasksPerDay = data.reduce((sum, day) => sum + day.tasksTotal, 0) / data.length;
    if (avgTasksPerDay > 8) {
      recommendations.push({
        type: 'productivity',
        title: 'Consider Task Prioritization',
        description: 'You\'re setting many tasks daily. Try focusing on 3-5 most important tasks.',
        priority: 'medium',
        action: 'Review your task list and prioritize'
      });
    } else if (avgTasksPerDay < 2) {
      recommendations.push({
        type: 'productivity',
        title: 'Increase Task Engagement',
        description: 'Setting more tasks can help build momentum and structure.',
        priority: 'medium',
        action: 'Add more tasks to your daily routine'
      });
    }

    // Wellness score recommendations
    if (wellnessScore < 40) {
      recommendations.push({
        type: 'wellness',
        title: 'Focus on Self-Care',
        description: 'Your wellness score suggests you might benefit from more self-care activities.',
        priority: 'high',
        action: 'Explore the Wellness section for relaxation techniques'
      });
    }

    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  };

  const identifyPatterns = (data: HistoryEntry[]): Pattern[] => {
    const patterns: Pattern[] = [];
    
    // Mood patterns
    const moodCounts: { [key: string]: number } = {};
    data.forEach(day => {
      if (day.mood?.label) {
        moodCounts[day.mood.label] = (moodCounts[day.mood.label] || 0) + 1;
      }
    });
    
    const mostCommonMood = Object.entries(moodCounts).sort(([,a], [,b]) => b - a)[0];
    if (mostCommonMood) {
      patterns.push({
        type: 'Mood Pattern',
        description: `You most frequently experience ${mostCommonMood[0]} (${mostCommonMood[1]} times)`,
        confidence: Math.min(mostCommonMood[1] / data.length * 100, 95),
        trend: 'stable'
      });
    }

    // Productivity patterns
    const productiveDays = data.filter(day => day.tasksCompleted > 0).length;
    const productivityRate = (productiveDays / data.length) * 100;
    
    if (productivityRate >= 70) {
      patterns.push({
        type: 'Productivity Pattern',
        description: 'You maintain high productivity most days',
        confidence: productivityRate,
        trend: 'improving'
      });
    } else if (productivityRate <= 30) {
      patterns.push({
        type: 'Productivity Pattern',
        description: 'You struggle with task completion',
        confidence: 100 - productivityRate,
        trend: 'declining'
      });
    }

    return patterns;
  };

  const getWellnessScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getWellnessScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Advanced Analytics
          </h2>
          <p className="text-muted-foreground">Deep insights into your mental wellness and productivity patterns</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Wellness Score */}
      <Card className="border-none shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Overall Wellness Score</h3>
              <p className="text-muted-foreground">Based on your mood, productivity, and consistency</p>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${getWellnessScoreColor(analyticsData.wellnessScore)}`}>
                {analyticsData.wellnessScore}
              </div>
              <div className="text-sm text-muted-foreground">
                {getWellnessScoreLabel(analyticsData.wellnessScore)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analyticsData.productivityInsights.map((insight, index) => (
              <Card key={index} className="border-none shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{insight.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                      <Badge 
                        variant={insight.type === 'positive' ? 'default' : insight.type === 'negative' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        Impact: {insight.impact}/10
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analyticsData.patterns.map((pattern, index) => (
              <Card key={index} className="border-none shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`text-2xl ${
                      pattern.trend === 'improving' ? 'text-green-600' : 
                      pattern.trend === 'declining' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {pattern.trend === 'improving' ? '📈' : 
                       pattern.trend === 'declining' ? '📉' : '📊'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{pattern.type}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{pattern.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {Math.round(pattern.confidence)}% confidence
                        </Badge>
                        <Badge 
                          variant={pattern.trend === 'improving' ? 'default' : pattern.trend === 'declining' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {pattern.trend}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="space-y-4">
            {analyticsData.recommendations.map((rec, index) => (
              <Card key={index} className="border-none shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`text-2xl ${
                      rec.priority === 'high' ? 'text-red-600' : 
                      rec.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                    }`}>
                      {rec.priority === 'high' ? '🚨' : rec.priority === 'medium' ? '⚠️' : '💡'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{rec.title}</h4>
                        <Badge 
                          variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {rec.priority} priority
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                      <Button variant="outline" size="sm" className="text-xs">
                        {rec.action}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Mood Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.moodTrends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{trend.emoji}</span>
                      <div>
                        <div className="font-medium">{trend.mood}</div>
                        <div className="text-sm text-muted-foreground">{trend.date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{trend.score}/10</div>
                      <div className="text-sm text-muted-foreground">Mood Score</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 