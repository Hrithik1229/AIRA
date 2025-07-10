import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Flame, Lightbulb, Plus, Target, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface Habit {
  id: string;
  name: string;
  description: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  target: number;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  createdAt: Date;
  completedDates: string[];
  reminderTime?: string;
}

interface HabitSuggestion {
  name: string;
  description: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  target: number;
  reason: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const habitCategories = [
  { id: "health", label: "Health & Fitness", icon: "🏃‍♀️" },
  { id: "mindfulness", label: "Mindfulness", icon: "🧘‍♀️" },
  { id: "productivity", label: "Productivity", icon: "⚡" },
  { id: "learning", label: "Learning", icon: "📚" },
  { id: "relationships", label: "Relationships", icon: "💝" },
  { id: "creativity", label: "Creativity", icon: "🎨" },
  { id: "finance", label: "Finance", icon: "💰" }
];

const habitSuggestions: HabitSuggestion[] = [
  {
    name: "Morning Meditation",
    description: "Start your day with 10 minutes of mindfulness",
    category: "mindfulness",
    frequency: "daily",
    target: 1,
    reason: "Improves focus and reduces stress throughout the day",
    difficulty: "easy"
  },
  {
    name: "Daily Exercise",
    description: "Get at least 30 minutes of physical activity",
    category: "health",
    frequency: "daily",
    target: 1,
    reason: "Boosts energy, mood, and overall health",
    difficulty: "medium"
  },
  {
    name: "Read 20 Pages",
    description: "Read at least 20 pages of a book",
    category: "learning",
    frequency: "daily",
    target: 1,
    reason: "Expands knowledge and improves cognitive function",
    difficulty: "easy"
  },
  {
    name: "Drink 8 Glasses of Water",
    description: "Stay hydrated throughout the day",
    category: "health",
    frequency: "daily",
    target: 1,
    reason: "Essential for physical and mental performance",
    difficulty: "easy"
  },
  {
    name: "Gratitude Journal",
    description: "Write down 3 things you're grateful for",
    category: "mindfulness",
    frequency: "daily",
    target: 1,
    reason: "Improves mood and mental well-being",
    difficulty: "easy"
  },
  {
    name: "Weekly Planning",
    description: "Plan your week ahead every Sunday",
    category: "productivity",
    frequency: "weekly",
    target: 1,
    reason: "Increases productivity and reduces stress",
    difficulty: "medium"
  },
  {
    name: "Call a Friend",
    description: "Reach out to a friend or family member",
    category: "relationships",
    frequency: "weekly",
    target: 1,
    reason: "Strengthens relationships and improves social well-being",
    difficulty: "medium"
  },
  {
    name: "Creative Time",
    description: "Spend time on a creative hobby",
    category: "creativity",
    frequency: "weekly",
    target: 2,
    reason: "Reduces stress and improves problem-solving skills",
    difficulty: "medium"
  }
];

export function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: "",
    description: "",
    category: "",
    frequency: "daily" as const,
    target: 1,
    reminderTime: ""
  });

  // Load habits from localStorage
  useEffect(() => {
    const savedHabits = localStorage.getItem('habits');
    if (savedHabits) {
      const parsedHabits = JSON.parse(savedHabits);
      const habitsWithDates = parsedHabits.map((habit: any) => ({
        ...habit,
        createdAt: new Date(habit.createdAt),
        completedDates: habit.completedDates || []
      }));
      setHabits(habitsWithDates);
    }
  }, []);

  // Save habits to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  const createHabit = () => {
    if (!newHabit.name || !newHabit.category) return;

    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabit.name,
      description: newHabit.description,
      category: newHabit.category,
      frequency: newHabit.frequency,
      target: newHabit.target,
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: 0,
      createdAt: new Date(),
      completedDates: [],
      reminderTime: newHabit.reminderTime
    };

    setHabits(prev => [habit, ...prev]);
    setShowHabitForm(false);
    setNewHabit({
      name: "",
      description: "",
      category: "",
      frequency: "daily",
      target: 1,
      reminderTime: ""
    });
  };

  const toggleHabitCompletion = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    setHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        const isCompletedToday = habit.completedDates.includes(today);
        let newCompletedDates = [...habit.completedDates];
        
        if (isCompletedToday) {
          // Remove today's completion
          newCompletedDates = newCompletedDates.filter(date => date !== today);
        } else {
          // Add today's completion
          newCompletedDates.push(today);
        }
        
        // Calculate new streak
        const newStreak = calculateStreak(newCompletedDates, habit.frequency);
        const newLongestStreak = Math.max(habit.longestStreak, newStreak);
        
        return {
          ...habit,
          completedDates: newCompletedDates,
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          totalCompletions: newCompletedDates.length
        };
      }
      return habit;
    }));
  };

  const calculateStreak = (completedDates: string[], frequency: string): number => {
    if (completedDates.length === 0) return 0;
    
    const sortedDates = completedDates.sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    let streak = 0;
    
    if (frequency === 'daily') {
      // Check consecutive days
      let currentDate = new Date(today);
      for (const dateStr of sortedDates) {
        const date = new Date(dateStr);
        const diffTime = Math.abs(currentDate.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 1) {
          streak++;
          currentDate = date;
        } else {
          break;
        }
      }
    } else if (frequency === 'weekly') {
      // Check consecutive weeks
      let currentWeek = getWeekNumber(new Date(today));
      for (const dateStr of sortedDates) {
        const date = new Date(dateStr);
        const weekNum = getWeekNumber(date);
        
        if (weekNum === currentWeek || weekNum === currentWeek - 1) {
          streak++;
          currentWeek = weekNum;
        } else {
          break;
        }
      }
    }
    
    return streak;
  };

  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const deleteHabit = (habitId: string) => {
    setHabits(prev => prev.filter(habit => habit.id !== habitId));
  };

  const getHabitProgress = (habit: Habit) => {
    const today = new Date().toISOString().split('T')[0];
    const isCompletedToday = habit.completedDates.includes(today);
    return isCompletedToday ? 100 : 0;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    return habitCategories.find(c => c.id === categoryId)?.icon || '📋';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Habit Tracker
          </h2>
          <p className="text-muted-foreground">Build positive habits and track your progress</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowSuggestions(true)} className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Suggestions
          </Button>
          <Button onClick={() => setShowHabitForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Habit
          </Button>
        </div>
      </div>

      {/* Habit Suggestions */}
      {showSuggestions && (
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              AI-Powered Habit Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {habitSuggestions.map((suggestion, index) => (
                <Card key={index} className="border border-dashed hover:border-primary/50 transition-colors cursor-pointer" onClick={() => {
                  setNewHabit({
                    name: suggestion.name,
                    description: suggestion.description,
                    category: suggestion.category,
                    frequency: suggestion.frequency,
                    target: suggestion.target,
                    reminderTime: ""
                  });
                  setShowSuggestions(false);
                  setShowHabitForm(true);
                }}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getCategoryIcon(suggestion.category)}</span>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{suggestion.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{suggestion.description}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getDifficultyColor(suggestion.difficulty)}>
                            {suggestion.difficulty}
                          </Badge>
                          <Badge variant="outline">
                            {suggestion.frequency}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{suggestion.reason}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setShowSuggestions(false)}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Habit Creation Form */}
      {showHabitForm && (
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Create New Habit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Habit Name</Label>
                <Input
                  id="name"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Morning Meditation"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newHabit.category} onValueChange={(value) => setNewHabit(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {habitCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <span className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          {category.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newHabit.description}
                onChange={(e) => setNewHabit(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your habit..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={newHabit.frequency} onValueChange={(value: any) => setNewHabit(prev => ({ ...prev, frequency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="target">Target</Label>
                <Input
                  id="target"
                  type="number"
                  value={newHabit.target}
                  onChange={(e) => setNewHabit(prev => ({ ...prev, target: parseInt(e.target.value) || 1 }))}
                  placeholder="1"
                />
              </div>
              <div>
                <Label htmlFor="reminder">Reminder Time (optional)</Label>
                <Input
                  id="reminder"
                  type="time"
                  value={newHabit.reminderTime}
                  onChange={(e) => setNewHabit(prev => ({ ...prev, reminderTime: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={createHabit} className="flex-1">Create Habit</Button>
              <Button variant="outline" onClick={() => setShowHabitForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Habits List */}
      {habits.length > 0 ? (
        <div className="space-y-4">
          {habits.map((habit) => (
            <Card key={habit.id} className="border-none shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getCategoryIcon(habit.category)}</span>
                      <h3 className="font-semibold text-lg">{habit.name}</h3>
                      <Badge variant="outline">
                        {habit.frequency}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">{habit.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Flame className="w-4 h-4" />
                        {habit.currentStreak} day streak
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        Best: {habit.longestStreak} days
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {habit.totalCompletions} total
                      </span>
                    </div>
                    
                    <Progress value={getHabitProgress(habit)} className="mb-4" />
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleHabitCompletion(habit.id)}
                      className="w-12 h-12"
                    >
                      <Checkbox checked={getHabitProgress(habit) === 100} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteHabit(habit.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-none shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-lg font-medium mb-2">No habits yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building positive habits to improve your life
            </p>
            <Button onClick={() => setShowSuggestions(true)} className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Get Suggestions
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 