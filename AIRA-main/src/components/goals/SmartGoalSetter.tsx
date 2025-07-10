import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Plus, Target, Trash2, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  target: number;
  current: number;
  unit: string;
  deadline: Date;
  status: 'active' | 'completed' | 'overdue';
  createdAt: Date;
  milestones: Milestone[];
}

interface Milestone {
  id: string;
  title: string;
  target: number;
  completed: boolean;
}

const goalCategories = [
  { id: "health", label: "Health & Wellness", icon: "🏃‍♀️" },
  { id: "productivity", label: "Productivity", icon: "⚡" },
  { id: "learning", label: "Learning & Growth", icon: "📚" },
  { id: "relationships", label: "Relationships", icon: "💝" },
  { id: "finance", label: "Financial", icon: "💰" },
  { id: "creativity", label: "Creativity", icon: "🎨" },
  { id: "mindfulness", label: "Mindfulness", icon: "🧘‍♀️" }
];

const goalTemplates = [
  {
    title: "Daily Meditation",
    description: "Build a consistent meditation practice",
    category: "mindfulness",
    target: 30,
    unit: "days",
    suggestions: ["Start with 5 minutes daily", "Use guided meditation apps", "Track your mood before and after"]
  },
  {
    title: "Exercise Routine",
    description: "Establish a regular exercise habit",
    category: "health",
    target: 90,
    unit: "minutes per week",
    suggestions: ["Start with 3 days per week", "Mix cardio and strength training", "Find activities you enjoy"]
  },
  {
    title: "Read More Books",
    description: "Develop a reading habit",
    category: "learning",
    target: 12,
    unit: "books this year",
    suggestions: ["Set aside 30 minutes daily", "Join a book club", "Keep a reading journal"]
  },
  {
    title: "Save Money",
    description: "Build your savings",
    category: "finance",
    target: 5000,
    unit: "dollars",
    suggestions: ["Set up automatic transfers", "Track your expenses", "Find ways to reduce spending"]
  }
];

export function SmartGoalSetter() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "",
    target: 0,
    unit: "",
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  });

  // Load goals from localStorage
  useEffect(() => {
    const savedGoals = localStorage.getItem('smart-goals');
    if (savedGoals) {
      const parsedGoals = JSON.parse(savedGoals);
      // Convert date strings back to Date objects
      const goalsWithDates = parsedGoals.map((goal: any) => ({
        ...goal,
        deadline: new Date(goal.deadline),
        createdAt: new Date(goal.createdAt),
        milestones: goal.milestones || []
      }));
      setGoals(goalsWithDates);
    }
  }, []);

  // Save goals to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('smart-goals', JSON.stringify(goals));
  }, [goals]);

  const createGoal = () => {
    if (!newGoal.title || !newGoal.category || newGoal.target <= 0) return;

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      category: newGoal.category,
      target: newGoal.target,
      current: 0,
      unit: newGoal.unit,
      deadline: newGoal.deadline,
      status: 'active',
      createdAt: new Date(),
      milestones: generateMilestones(newGoal.target, newGoal.unit)
    };

    setGoals(prev => [goal, ...prev]);
    setShowGoalForm(false);
    setNewGoal({
      title: "",
      description: "",
      category: "",
      target: 0,
      unit: "",
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
  };

  const generateMilestones = (target: number, unit: string): Milestone[] => {
    const milestones: Milestone[] = [];
    const steps = Math.min(5, Math.ceil(target / 10));
    
    for (let i = 1; i <= steps; i++) {
      const milestoneTarget = Math.round((target / steps) * i);
      milestones.push({
        id: `milestone-${i}`,
        title: `${milestoneTarget} ${unit}`,
        target: milestoneTarget,
        completed: false
      });
    }
    
    return milestones;
  };

  const updateGoalProgress = (goalId: string, newProgress: number) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const updatedGoal = { ...goal, current: newProgress };
        
        // Update status based on progress and deadline
        if (newProgress >= goal.target) {
          updatedGoal.status = 'completed';
        } else if (new Date() > goal.deadline) {
          updatedGoal.status = 'overdue';
        } else {
          updatedGoal.status = 'active';
        }
        
        // Update milestone completion
        updatedGoal.milestones = goal.milestones.map(milestone => ({
          ...milestone,
          completed: newProgress >= milestone.target
        }));
        
        return updatedGoal;
      }
      return goal;
    }));
  };

  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
  };

  const getGoalProgress = (goal: Goal) => {
    return Math.min((goal.current / goal.target) * 100, 100);
  };

  const getDaysRemaining = (deadline: Date) => {
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'overdue': return '⏰';
      default: return '🎯';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Smart Goals
          </h2>
          <p className="text-muted-foreground">Set and track your personal goals with AI guidance</p>
        </div>
        <Button onClick={() => setShowGoalForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Goal
        </Button>
      </div>

      {/* Goal Templates */}
      {!showGoalForm && goals.length === 0 && (
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Suggested Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goalTemplates.map((template, index) => (
                <Card key={index} className="border border-dashed hover:border-primary/50 transition-colors cursor-pointer" onClick={() => {
                  setSelectedTemplate(template.title);
                  setNewGoal({
                    title: template.title,
                    description: template.description,
                    category: template.category,
                    target: template.target,
                    unit: template.unit,
                    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                  });
                  setShowGoalForm(true);
                }}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{goalCategories.find(c => c.id === template.category)?.icon}</span>
                      <h4 className="font-medium">{template.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                    <div className="space-y-1">
                      {template.suggestions.map((suggestion, i) => (
                        <div key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                          <span className="w-1 h-1 bg-primary rounded-full"></span>
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goal Creation Form */}
      {showGoalForm && (
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Create New Goal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Goal Title</Label>
                <Input
                  id="title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Daily Meditation"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newGoal.category} onValueChange={(value) => setNewGoal(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {goalCategories.map((category) => (
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
              <Textarea
                id="description"
                value={newGoal.description}
                onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your goal and why it's important to you..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="target">Target</Label>
                <Input
                  id="target"
                  type="number"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, target: parseInt(e.target.value) || 0 }))}
                  placeholder="100"
                />
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={newGoal.unit}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, unit: e.target.value }))}
                  placeholder="e.g., days, books, dollars"
                />
              </div>
              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newGoal.deadline.toISOString().split('T')[0]}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: new Date(e.target.value) }))}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={createGoal} className="flex-1">Create Goal</Button>
              <Button variant="outline" onClick={() => setShowGoalForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goals List */}
      {goals.length > 0 && (
        <div className="space-y-4">
          {goals.map((goal) => (
            <Card key={goal.id} className="border-none shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{goalCategories.find(c => c.id === goal.category)?.icon}</span>
                      <h3 className="font-semibold text-lg">{goal.title}</h3>
                      <Badge className={getStatusColor(goal.status)}>
                        {getStatusIcon(goal.status)} {goal.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">{goal.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {getDaysRemaining(goal.deadline)} days left
                      </span>
                      <span>
                        {goal.current} / {goal.target} {goal.unit}
                      </span>
                    </div>
                    
                    <Progress value={getGoalProgress(goal)} className="mb-4" />
                    
                    {/* Milestones */}
                    <div className="flex gap-2 flex-wrap">
                      {goal.milestones.map((milestone) => (
                        <Badge
                          key={milestone.id}
                          variant={milestone.completed ? "default" : "outline"}
                          className={milestone.completed ? "bg-green-100 text-green-800" : ""}
                        >
                          {milestone.completed ? "✓" : "○"} {milestone.title}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newProgress = prompt(`Update progress for ${goal.title} (current: ${goal.current}):`);
                        if (newProgress !== null) {
                          updateGoalProgress(goal.id, parseInt(newProgress) || goal.current);
                        }
                      }}
                    >
                      Update
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteGoal(goal.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 