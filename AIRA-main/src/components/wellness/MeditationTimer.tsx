import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { notificationService } from "@/services/notification-service";
import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";

interface MeditationSession {
  id: string;
  title: string;
  duration: number;
  description: string;
  category: string;
  audioUrl?: string;
}

const meditationSessions: MeditationSession[] = [
  {
    id: "mindfulness",
    title: "Mindfulness Meditation",
    duration: 300, // 5 minutes
    description: "Focus on your breath and present moment awareness",
    category: "Beginner"
  },
  {
    id: "loving-kindness",
    title: "Loving-Kindness Meditation",
    duration: 600, // 10 minutes
    description: "Cultivate compassion for yourself and others",
    category: "Intermediate"
  },
  {
    id: "body-scan",
    title: "Body Scan Meditation",
    duration: 900, // 15 minutes
    description: "Progressive relaxation through body awareness",
    category: "Beginner"
  },
  {
    id: "transcendental",
    title: "Transcendental Meditation",
    duration: 1200, // 20 minutes
    description: "Deep relaxation and inner peace",
    category: "Advanced"
  },
  {
    id: "zen",
    title: "Zen Meditation",
    duration: 1800, // 30 minutes
    description: "Traditional sitting meditation for clarity",
    category: "Advanced"
  }
];

export function MeditationTimer() {
  const [selectedSession, setSelectedSession] = useState<MeditationSession>(meditationSessions[0]);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(selectedSession.duration);
  const [isMuted, setIsMuted] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    totalSessions: 0,
    totalMinutes: 0,
    currentStreak: 0
  });

  // Load session stats from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('meditation-stats');
    if (savedStats) {
      setSessionStats(JSON.parse(savedStats));
    }
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Update time when session changes
  useEffect(() => {
    setTimeLeft(selectedSession.duration);
    setIsActive(false);
  }, [selectedSession]);

  const handleSessionComplete = () => {
    setIsActive(false);
    
    // Update stats
    const newStats = {
      totalSessions: sessionStats.totalSessions + 1,
      totalMinutes: sessionStats.totalMinutes + Math.ceil(selectedSession.duration / 60),
      currentStreak: sessionStats.currentStreak + 1
    };
    
    setSessionStats(newStats);
    localStorage.setItem('meditation-stats', JSON.stringify(newStats));
    
    // Show completion notification using the service
    if (notificationService.getPermission() === 'granted') {
      const notification = new Notification('Meditation Complete! 🧘‍♀️', {
        body: `Great job! You've completed ${selectedSession.title}`,
        icon: '/favicon.ico'
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  };

  const startSession = () => {
    setIsActive(true);
  };

  const pauseSession = () => {
    setIsActive(false);
  };

  const resetSession = () => {
    setIsActive(false);
    setTimeLeft(selectedSession.duration);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    return ((selectedSession.duration - timeLeft) / selectedSession.duration) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Session Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-none shadow-md bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{sessionStats.totalSessions}</div>
            <div className="text-sm text-muted-foreground">Total Sessions</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{sessionStats.totalMinutes}m</div>
            <div className="text-sm text-muted-foreground">Total Minutes</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{sessionStats.currentStreak}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </CardContent>
        </Card>
      </div>

      {/* Session Selection */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🧘‍♀️</span>
            Choose Your Meditation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedSession.id} onValueChange={(value) => {
            const session = meditationSessions.find(s => s.id === value);
            if (session) setSelectedSession(session);
          }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {meditationSessions.map((session) => (
                <SelectItem key={session.id} value={session.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{session.title}</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.ceil(session.duration / 60)} min • {session.category}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">{selectedSession.title}</h4>
            <p className="text-sm text-muted-foreground">{selectedSession.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                {Math.ceil(selectedSession.duration / 60)} minutes
              </span>
              <span className="text-xs bg-secondary/10 text-secondary-foreground px-2 py-1 rounded">
                {selectedSession.category}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timer Display */}
      <Card className="border-none shadow-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white">
        <CardContent className="p-8 text-center">
          <div className="relative inline-block">
            <ProgressRing
              progress={getProgress()}
              size={200}
              strokeWidth={8}
              className="text-white"
              showLabel={false}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div>
                <div className="text-4xl font-bold mb-2">{formatTime(timeLeft)}</div>
                <div className="text-sm opacity-80">{selectedSession.title}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card className="border-none shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
              className="w-12 h-12"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={resetSession}
              className="w-12 h-12"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
            
            <Button
              onClick={isActive ? pauseSession : startSession}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white"
            >
              {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Guided Instructions */}
      {isActive && (
        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardContent className="p-6">
            <h4 className="font-medium mb-3">Guided Instructions</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Find a comfortable seated position</p>
              <p>• Close your eyes or soften your gaze</p>
              <p>• Take a few deep breaths to settle in</p>
              <p>• Focus on your natural breath rhythm</p>
              <p>• When your mind wanders, gently return to your breath</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 