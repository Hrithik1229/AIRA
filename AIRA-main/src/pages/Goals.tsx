import { SmartGoalSetter } from "@/components/goals/SmartGoalSetter";
import { HabitTracker } from "@/components/habits/HabitTracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flame, Target } from "lucide-react";

export default function Goals() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="transform-gpu transition-all duration-500 hover:scale-105">
        <h1 className="text-3xl font-bold text-foreground mb-2 animate-tilt">Goals & Habits</h1>
        <p className="text-muted-foreground">
          Set meaningful goals and build positive habits for lasting change 🎯
        </p>
      </div>

      <Tabs defaultValue="goals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Smart Goals
          </TabsTrigger>
          <TabsTrigger value="habits" className="flex items-center gap-2">
            <Flame className="w-4 h-4" />
            Habit Tracker
          </TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="space-y-6">
          <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Goal Setting with AI Guidance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Set SMART (Specific, Measurable, Achievable, Relevant, Time-bound) goals with AI-powered suggestions 
                and track your progress with automatic milestone generation.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>AI-powered goal suggestions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>Automatic milestone tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>Progress visualization</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <SmartGoalSetter />
        </TabsContent>

        <TabsContent value="habits" className="space-y-6">
          <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-green-600" />
                Habit Building & Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Build positive habits with AI-powered suggestions and track your streaks. 
                Research shows it takes 21-66 days to form a habit - let's make it count!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span>Streak tracking & motivation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span>Smart habit suggestions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span>Progress analytics</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <HabitTracker />
        </TabsContent>
      </Tabs>
    </div>
  );
} 