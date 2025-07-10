import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { authService } from "@/services/auth-service";
import { historyService, type HistoryEntry } from "@/services/history-service";
import {
    CheckCircle,
    Clock,
    Heart,
    Mic,
    Pause,
    Plus,
    RefreshCw,
    Sparkles,
    Timer,
    TrendingUp,
    X,
    Zap
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoodChatbot } from "../ai/MoodChatbot";
import { TaskQuickAdd } from "../tasks/TaskQuickAdd";
import { VoiceAssistant } from "../voice/VoiceAssistant";

const affirmations = [
  "You are enough, just as you are.",
  "Every day is a fresh start.",
  "You have the power to create change.",
  "Small steps lead to big progress.",
  "Your feelings are valid.",
  "Breathe in calm, breathe out stress.",
  "You are doing your best, and that's enough."
];

const quickMoods = [
  { label: "Happy", emoji: "😊", color: "from-yellow-400 to-orange-400" },
  { label: "Calm", emoji: "😌", color: "from-green-400 to-teal-400" },
  { label: "Excited", emoji: "🤩", color: "from-pink-400 to-purple-400" },
  { label: "Grateful", emoji: "🙏", color: "from-emerald-400 to-green-400" },
  { label: "Sad", emoji: "😢", color: "from-blue-400 to-indigo-400" },
  { label: "Stressed", emoji: "😰", color: "from-orange-400 to-red-400" }
];

const breathingTechniques = [
  { name: "4-7-8 Breathing", duration: "4 min", description: "Calm your nervous system" },
  { name: "Box Breathing", duration: "3 min", description: "Improve focus and concentration" },
  { name: "Deep Breathing", duration: "5 min", description: "Reduce stress and anxiety" }
];

const wellnessActivities = [
  { name: "Mindful Walking", icon: "🚶", duration: "10 min", description: "Connect with nature" },
  { name: "Gratitude Journal", icon: "📝", duration: "5 min", description: "Practice gratitude" },
  { name: "Body Scan", icon: "🧘", duration: "8 min", description: "Relax your body" },
  { name: "Loving Kindness", icon: "💝", duration: "6 min", description: "Cultivate compassion" }
];

function getMoodEmoji(label: string) {
  switch (label) {
    case "Happy": return "😊";
    case "Sad": return "😢";
    case "Angry": return "😠";
    case "Anxious": return "😨";
    case "Calm": return "😌";
    case "Stressed": return "😰";
    case "Excited": return "🤩";
    case "Grateful": return "🙏";
    case "Lonely": return "😔";
    case "Depressed": return "😞";
    default: return "😐";
  }
}

function getMoodColor(label: string) {
  switch (label) {
    case "Happy": return "from-yellow-400 to-orange-400";
    case "Sad": return "from-blue-400 to-indigo-400";
    case "Angry": return "from-red-400 to-pink-400";
    case "Anxious": return "from-purple-400 to-pink-400";
    case "Calm": return "from-green-400 to-teal-400";
    case "Stressed": return "from-orange-400 to-red-400";
    case "Excited": return "from-pink-400 to-purple-400";
    case "Grateful": return "from-emerald-400 to-green-400";
    case "Lonely": return "from-gray-400 to-blue-400";
    case "Depressed": return "from-gray-500 to-gray-600";
    default: return "from-gray-300 to-gray-400";
  }
}

export function Dashboard() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userName, setUserName] = useState("Friend");
  const [affirmationIndex, setAffirmationIndex] = useState(0);
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);
  const [showQuickMood, setShowQuickMood] = useState(false);
  const [showBreathingOptions, setShowBreathingOptions] = useState(false);
  const [showWellnessActivities, setShowWellnessActivities] = useState(false);
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathingTime, setBreathingTime] = useState(0);
  const [selectedBreathing, setSelectedBreathing] = useState(breathingTechniques[0]);

  useEffect(() => {
    // Get user name from auth service
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUserName(currentUser.name);
    }
    
    setHistoryData(historyService.getHistory());
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    const affirmationTimer = setInterval(() => setAffirmationIndex(i => (i + 1) % affirmations.length), 10000);
    return () => {
      clearInterval(timer);
      clearInterval(affirmationTimer);
    };
  }, []);

  // Breathing timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBreathingActive && breathingTime > 0) {
      interval = setInterval(() => {
        setBreathingTime(prev => {
          if (prev <= 1) {
            setIsBreathingActive(false);
            // Show completion notification when session ends naturally
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Breathing Session Complete! 🧘‍♀️', {
                body: 'Great job completing your breathing session. How do you feel now?',
                icon: '/favicon.ico'
              });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreathingActive, breathingTime]);

  // Greeting
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Mood trend (last 7 days)
  const last7 = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const entry = historyData.find(h => {
        const hd = new Date(h.date);
        hd.setHours(0, 0, 0, 0);
        return hd.getTime() === d.getTime();
      });
      days.push({
        date: d,
        mood: entry?.mood?.label || null,
        emoji: entry?.mood ? getMoodEmoji(entry.mood.label) : "-"
      });
    }
    return days;
  }, [historyData]);

  // Current mood (today)
  const todayMood = last7[6]?.mood;
  const todayMoodEmoji = last7[6]?.emoji;

  // Task stats
  const todayEntry = historyData.find(h => {
    const hd = new Date(h.date);
    hd.setHours(0, 0, 0, 0);
    const td = new Date();
    td.setHours(0, 0, 0, 0);
    return hd.getTime() === td.getTime();
  });
  const tasksCompleted = todayEntry?.tasksCompleted || 0;
  const tasksTotal = todayEntry?.tasksTotal || 0;
  const taskProgress = tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0;

  // Streaks
  const moodStreak = useMemo(() => {
    let streak = 0;
    let lastMood = null;
    for (let i = last7.length - 1; i >= 0; i--) {
      if (!last7[i].mood) break;
      if (lastMood && last7[i].mood !== lastMood) break;
      streak++;
      lastMood = last7[i].mood;
    }
    return streak;
  }, [last7]);

  const taskStreak = useMemo(() => {
    let streak = 0;
    for (let i = last7.length - 1; i >= 0; i--) {
      const entry = historyData.find(h => {
        const hd = new Date(h.date);
        hd.setHours(0, 0, 0, 0);
        const d = new Date();
        d.setDate(d.getDate() - (last7.length - 1 - i));
        d.setHours(0, 0, 0, 0);
        return hd.getTime() === d.getTime();
      });
      if (entry && entry.tasksCompleted > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [historyData, last7]);

  // Recent activity (last 3 days)
  const recent = last7.slice(-3).reverse();

  // Weekly mood distribution
  const moodDistribution = useMemo(() => {
    const distribution: { [key: string]: number } = {};
    last7.forEach(day => {
      if (day.mood) {
        distribution[day.mood] = (distribution[day.mood] || 0) + 1;
      }
    });
    return distribution;
  }, [last7]);

  // Navigation handlers
  const handleAddMood = () => {
    navigate('/mood');
  };

  const handleStartBreathing = () => {
    navigate('/wellness');
  };

  const handleWellnessCenter = () => {
    navigate('/wellness');
  };

  const handleViewTasks = () => {
    navigate('/tasks');
  };

  const handleViewHistory = () => {
    navigate('/history');
  };

  // Quick mood handlers
  const handleQuickMood = (mood: typeof quickMoods[0]) => {
    // Add mood to history
    const moodEntry = {
      emoji: mood.emoji,
      label: mood.label,
      confidence: 0.9,
      timestamp: new Date()
    };
    
    historyService.saveMood(moodEntry);
    setHistoryData(historyService.getHistory());
    setShowQuickMood(false);
    
    // Show success feedback
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Mood Tracked! 😊', {
        body: `You marked yourself as ${mood.label.toLowerCase()}. Keep up the great self-awareness!`,
        icon: '/favicon.ico'
      });
    }
  };

  // Breathing handlers
  const handleStartBreathingSession = (technique: typeof breathingTechniques[0]) => {
    setSelectedBreathing(technique);
    const duration = parseInt(technique.duration.split(' ')[0]) * 60; // Convert to seconds
    setBreathingTime(duration);
    setIsBreathingActive(true);
    setShowBreathingOptions(false);
  };

  const handleStopBreathing = () => {
    setIsBreathingActive(false);
    setBreathingTime(0);
    
    // Show completion feedback
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Breathing Session Complete! 🧘‍♀️', {
        body: 'Great job taking time for yourself. How do you feel now?',
        icon: '/favicon.ico'
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto px-4 py-4 sm:py-8 dashboard-container">
      {/* Enhanced Header Section */}
      <div className="text-center space-y-4 sm:space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 blur-3xl rounded-full"></div>
          <div className="relative">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold gradient-text mb-3 sm:mb-4 animate-fade-in">
              {getGreeting()}, {userName}! ✨
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Let's make today amazing. How are you feeling?
            </p>
          </div>
        </div>

        {/* Current Time Display */}
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">
            {currentTime.toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            })}
          </span>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 quick-actions-grid">
        <Card className="card-hover border-none shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl mx-auto mb-3 sm:mb-4 animate-float">
              😊
            </div>
            <h3 className="font-semibold text-base sm:text-lg mb-2">Track Mood</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">How are you feeling today?</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={() => setShowQuickMood(true)} 
                className="btn-primary-glow flex-1"
              >
                Quick Check
              </Button>
              <Button 
                onClick={() => navigate('/mood')} 
                variant="outline"
                className="flex-1"
              >
                Detailed
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-none shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl mx-auto mb-3 sm:mb-4 animate-float" style={{ animationDelay: '1s' }}>
              🧘‍♀️
            </div>
            <h3 className="font-semibold text-base sm:text-lg mb-2">Wellness Break</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">Take a moment to breathe</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={() => setShowBreathingOptions(true)} 
                className="btn-primary-glow flex-1"
              >
                Breathing
              </Button>
              <Button 
                onClick={() => setShowWellnessActivities(true)} 
                variant="outline"
                className="flex-1"
              >
                Activities
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-none shadow-lg bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl mx-auto mb-3 sm:mb-4 animate-float" style={{ animationDelay: '2s' }}>
              📋
            </div>
            <h3 className="font-semibold text-base sm:text-lg mb-2">Quick Task</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">Add something to your list</p>
            <Button 
              onClick={() => navigate('/tasks')} 
              className="btn-primary-glow w-full"
            >
              Add Task
            </Button>
          </CardContent>
        </Card>

        <Card className="card-hover border-none shadow-lg bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl mx-auto mb-3 sm:mb-4 animate-float" style={{ animationDelay: '3s' }}>
              🎯
            </div>
            <h3 className="font-semibold text-base sm:text-lg mb-2">Set Goals</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">Work on your aspirations</p>
            <Button 
              onClick={() => navigate('/goals')} 
              className="btn-primary-glow w-full"
            >
              View Goals
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 stats-grid">
        <Card className="card-hover border-none shadow-lg bg-gradient-to-br from-success/10 to-success/5">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Progress</p>
                <p className="text-2xl font-bold text-success">
                  {tasksCompleted}/{tasksTotal}
                </p>
                <p className="text-xs text-muted-foreground">tasks completed</p>
              </div>
              <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
            </div>
                         <div className="w-full bg-muted rounded-full h-2 mt-4">
               <div 
                 className="bg-success h-2 rounded-full transition-all duration-500" 
                 style={{ width: `${taskProgress}%` }}
               />
             </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-none shadow-lg bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mood Streak</p>
                <p className="text-2xl font-bold text-primary">{moodStreak}</p>
                <p className="text-xs text-muted-foreground">days tracked</p>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-none shadow-lg bg-gradient-to-br from-warning/10 to-warning/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Task Streak</p>
                <p className="text-2xl font-bold text-warning">{taskStreak}</p>
                <p className="text-xs text-muted-foreground">days productive</p>
              </div>
              <div className="w-12 h-12 bg-warning/20 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-none shadow-lg bg-gradient-to-br from-accent/10 to-accent/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Mood</p>
                <p className="text-2xl font-bold">{todayMoodEmoji || "😐"}</p>
                <p className="text-xs text-muted-foreground">{todayMood || "Not tracked"}</p>
              </div>
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-accent-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Affirmation */}
      <Card className="card-hover border-none shadow-xl bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5">
        <CardContent className="p-8 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="text-4xl mb-4 animate-float">✨</div>
            <blockquote className="text-xl font-medium text-foreground mb-4 italic">
              "{affirmations[affirmationIndex]}"
            </blockquote>
            <Button 
              variant="ghost" 
              onClick={() => setAffirmationIndex(i => (i + 1) % affirmations.length)}
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              New affirmation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Chat Section */}
      <Card className="card-hover border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
                            Chat with AIRA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MoodChatbot />
        </CardContent>
      </Card>

      {/* Voice Assistant Section */}
      <Card className="card-hover border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white">
              <Mic className="w-4 h-4" />
            </div>
            Voice Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VoiceAssistant 
            onQuickMood={(mood) => {
              // Handle quick mood logging
              const moodEntry = quickMoods.find(m => m.label === mood);
              if (moodEntry) {
                handleQuickMood(moodEntry);
              }
            }}
            onQuickTask={(task) => {
              // Handle quick task creation
              // This would integrate with your task service
              console.log("Voice task:", task);
            }}
            onStartBreathing={() => setShowBreathingOptions(true)}
            onStopBreathing={handleStopBreathing}
          />
        </CardContent>
      </Card>

      {/* Quick Task Add */}
      <Card className="card-hover border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Quick Add Task
          </CardTitle>
        </CardHeader>
        <CardContent>
                     <TaskQuickAdd />
        </CardContent>
      </Card>

      {/* Quick Mood Modal */}
      <Dialog open={showQuickMood} onOpenChange={setShowQuickMood}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">😊</span>
              How are you feeling?
            </DialogTitle>
            <DialogDescription>
              Take a moment to check in with yourself. Your mood matters.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-4">
            {quickMoods.map((mood) => (
              <Button
                key={mood.label}
                variant="outline"
                className="h-16 sm:h-20 flex flex-col items-center justify-center gap-1 sm:gap-2 hover:scale-105 transition-transform"
                onClick={() => handleQuickMood(mood)}
              >
                <span className="text-xl sm:text-2xl">{mood.emoji}</span>
                <span className="text-xs sm:text-sm font-medium">{mood.label}</span>
              </Button>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowQuickMood(false)}>
              Cancel
            </Button>
            <Button onClick={() => navigate('/mood')}>
              Detailed Check-in
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Breathing Session Modal */}
      <Dialog open={showBreathingOptions} onOpenChange={setShowBreathingOptions}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">🧘‍♀️</span>
              Choose Your Breathing Technique
            </DialogTitle>
            <DialogDescription>
              Select a breathing technique to help you relax and focus.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {breathingTechniques.map((technique) => (
              <Button
                key={technique.name}
                variant="outline"
                className="w-full h-16 flex items-center justify-between p-4 hover:bg-primary/5"
                onClick={() => handleStartBreathingSession(technique)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Timer className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{technique.name}</div>
                    <div className="text-sm text-muted-foreground">{technique.description}</div>
                  </div>
                </div>
                <div className="text-sm font-medium text-primary">{technique.duration}</div>
              </Button>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowBreathingOptions(false)}>
              Cancel
            </Button>
            <Button onClick={() => navigate('/wellness')}>
              More Wellness Activities
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Active Breathing Session Modal */}
      <Dialog open={isBreathingActive} onOpenChange={() => !isBreathingActive && handleStopBreathing()}>
        <DialogContent className="w-[95vw] max-w-sm mx-auto text-center">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2">
              <span className="text-3xl">🧘‍♀️</span>
              {selectedBreathing.name}
            </DialogTitle>
            <DialogDescription>
              {selectedBreathing.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="my-6 sm:my-8">
            <div className="text-4xl sm:text-6xl font-bold text-primary mb-4">
              {formatTime(breathingTime)}
            </div>
            
            {/* Breathing animation */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
              <div className="absolute inset-4 bg-primary/40 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute inset-8 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
            
            <div className="text-sm text-muted-foreground mb-6">
              Breathe in... and out... Focus on your breath
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={handleStopBreathing}
              className="flex items-center gap-2"
            >
              <Pause className="w-4 h-4" />
              Pause
            </Button>
            <Button
              size="lg"
              onClick={handleStopBreathing}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              End Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Wellness Activities Modal */}
      <Dialog open={showWellnessActivities} onOpenChange={setShowWellnessActivities}>
        <DialogContent className="w-[95vw] max-w-lg mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">💝</span>
              Wellness Activities
            </DialogTitle>
            <DialogDescription>
              Choose an activity to boost your well-being and mental health.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 mt-4">
            {wellnessActivities.map((activity) => (
              <Button
                key={activity.name}
                variant="outline"
                className="w-full h-16 flex items-center justify-between p-4 hover:bg-primary/5"
                onClick={() => {
                  setShowWellnessActivities(false);
                  navigate('/wellness');
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-xl">
                    {activity.icon}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{activity.name}</div>
                    <div className="text-sm text-muted-foreground">{activity.description}</div>
                  </div>
                </div>
                <div className="text-sm font-medium text-primary">{activity.duration}</div>
              </Button>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowWellnessActivities(false)}>
              Cancel
            </Button>
            <Button onClick={() => navigate('/wellness')}>
              Explore More
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}