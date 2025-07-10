import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
    Award,
    Clock,
    Heart,
    Pause,
    Play,
    RotateCcw,
    Settings,
    Target,
    Timer,
    Volume2,
    VolumeX,
    Wind,
    Zap
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface BreathingTechnique {
  id: string;
  name: string;
  description: string;
  inhale: number;
  hold: number;
  exhale: number;
  holdAfterExhale: number;
  cycles: number;
  icon: React.ReactNode;
  color: string;
  benefits: string[];
}

const breathingTechniques: BreathingTechnique[] = [
  {
    id: "4-7-8",
    name: "4-7-8 Breathing",
    description: "Calm your nervous system and reduce anxiety",
    inhale: 4,
    hold: 7,
    exhale: 8,
    holdAfterExhale: 0,
    cycles: 4,
    icon: <Heart className="w-5 h-5" />,
    color: "from-red-500 to-pink-500",
    benefits: ["Reduces anxiety", "Improves sleep", "Calms nervous system"]
  },
  {
    id: "box",
    name: "Box Breathing",
    description: "Enhance focus and reduce stress",
    inhale: 4,
    hold: 4,
    exhale: 4,
    holdAfterExhale: 4,
    cycles: 5,
    icon: <Target className="w-5 h-5" />,
    color: "from-blue-500 to-indigo-500",
    benefits: ["Improves focus", "Reduces stress", "Balances nervous system"]
  },
  {
    id: "deep",
    name: "Deep Breathing",
    description: "Increase oxygen flow and relaxation",
    inhale: 6,
    hold: 2,
    exhale: 6,
    holdAfterExhale: 0,
    cycles: 6,
    icon: <Wind className="w-5 h-5" />,
    color: "from-green-500 to-emerald-500",
    benefits: ["Increases oxygen", "Promotes relaxation", "Reduces tension"]
  },
  {
    id: "custom",
    name: "Custom Pattern",
    description: "Create your own breathing rhythm",
    inhale: 4,
    hold: 4,
    exhale: 4,
    holdAfterExhale: 0,
    cycles: 5,
    icon: <Zap className="w-5 h-5" />,
    color: "from-purple-500 to-violet-500",
    benefits: ["Personalized", "Adaptable", "Flexible timing"]
  }
];

type Phase = 'inhale' | 'hold' | 'exhale' | 'holdAfterExhale' | 'complete';

export function BreathingTimer() {
  const [selectedTechnique, setSelectedTechnique] = useState<BreathingTechnique>(breathingTechniques[0]);
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<Phase>('inhale');
  const [currentCycle, setCurrentCycle] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [customSettings, setCustomSettings] = useState({
    inhale: 4,
    hold: 4,
    exhale: 4,
    holdAfterExhale: 0,
    cycles: 5
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load session data from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('breathing-sessions');
    const savedMinutes = localStorage.getItem('breathing-minutes');
    if (savedSessions) setTotalSessions(parseInt(savedSessions));
    if (savedMinutes) setTotalMinutes(parseInt(savedMinutes));
  }, []);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/breathing-sound.mp3'); // You can add a gentle breathing sound
    audioRef.current.volume = 0.3;
  }, []);

  const getPhaseTime = (phase: Phase): number => {
    if (phase === 'inhale') return selectedTechnique.inhale;
    if (phase === 'hold') return selectedTechnique.hold;
    if (phase === 'exhale') return selectedTechnique.exhale;
    if (phase === 'holdAfterExhale') return selectedTechnique.holdAfterExhale;
    return 0;
  };

  const getPhaseInstructions = (phase: Phase): string => {
    switch (phase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'holdAfterExhale': return 'Hold';
      case 'complete': return 'Complete';
      default: return '';
    }
  };

  const getPhaseColor = (phase: Phase): string => {
    switch (phase) {
      case 'inhale': return 'text-green-500';
      case 'hold': return 'text-blue-500';
      case 'exhale': return 'text-red-500';
      case 'holdAfterExhale': return 'text-purple-500';
      case 'complete': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const startSession = () => {
    setIsActive(true);
    setCurrentCycle(1);
    setCurrentPhase('inhale');
    setTimeLeft(selectedTechnique.inhale);
    
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {}); // Ignore autoplay errors
    }
  };

  const pauseSession = () => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resetSession = () => {
    setIsActive(false);
    setCurrentPhase('inhale');
    setCurrentCycle(1);
    setTimeLeft(selectedTechnique.inhale);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const completeSession = () => {
    const newSessions = totalSessions + 1;
    const sessionMinutes = Math.ceil(
      (selectedTechnique.inhale + selectedTechnique.hold + selectedTechnique.exhale + selectedTechnique.holdAfterExhale) * selectedTechnique.cycles / 60
    );
    const newMinutes = totalMinutes + sessionMinutes;
    
    setTotalSessions(newSessions);
    setTotalMinutes(newMinutes);
    
    // Save to localStorage
    localStorage.setItem('breathing-sessions', newSessions.toString());
    localStorage.setItem('breathing-minutes', newMinutes.toString());
    
    resetSession();
  };

  // Timer logic
  useEffect(() => {
    if (!isActive) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Move to next phase
          const phases: Phase[] = ['inhale', 'hold', 'exhale', 'holdAfterExhale'];
          const currentIndex = phases.indexOf(currentPhase);
          
          if (currentIndex === phases.length - 1 || 
              (currentPhase === 'exhale' && selectedTechnique.holdAfterExhale === 0)) {
            // Complete cycle
            if (currentCycle >= selectedTechnique.cycles) {
              completeSession();
              return 0;
            } else {
              setCurrentCycle(prev => prev + 1);
              setCurrentPhase('inhale');
              return selectedTechnique.inhale;
            }
          } else {
            setCurrentPhase(phases[currentIndex + 1]);
            return getPhaseTime(phases[currentIndex + 1]);
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, currentPhase, currentCycle, selectedTechnique]);

  const updateCustomTechnique = () => {
    const updated = {
      ...selectedTechnique,
      ...customSettings
    };
    setSelectedTechnique(updated);
    setTimeLeft(updated.inhale);
  };

  return (
    <div className="space-y-6">
      {/* Technique Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {breathingTechniques.map((technique) => (
          <Card 
            key={technique.id}
            className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
              selectedTechnique.id === technique.id 
                ? 'ring-2 ring-primary shadow-lg' 
                : 'hover:shadow-md'
            }`}
            onClick={() => {
              setSelectedTechnique(technique);
              setTimeLeft(technique.inhale);
              resetSession();
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${technique.color} rounded-full flex items-center justify-center text-white`}>
                  {technique.icon}
                </div>
                <div>
                  <h3 className="font-semibold">{technique.name}</h3>
                  <p className="text-sm text-muted-foreground">{technique.description}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Inhale: {technique.inhale}s</span>
                  <span>Hold: {technique.hold}s</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Exhale: {technique.exhale}s</span>
                  <span>Cycles: {technique.cycles}</span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {technique.benefits.map((benefit, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {benefit}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Timer Display */}
      <Card className="border-none shadow-lg bg-gradient-to-br from-primary-soft to-accent">
        <CardHeader>
          <CardTitle className="text-center text-primary-foreground">
            {selectedTechnique.name} Breathing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-6">
            {/* Visual Guide */}
            <div className="relative">
              <div className={`w-32 h-32 mx-auto rounded-full border-4 transition-all duration-1000 ${
                currentPhase === 'inhale' ? 'border-green-500 scale-110' :
                currentPhase === 'hold' ? 'border-blue-500 scale-100' :
                currentPhase === 'exhale' ? 'border-red-500 scale-90' :
                'border-purple-500 scale-100'
              } flex items-center justify-center bg-background/20 backdrop-blur-sm`}>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getPhaseColor(currentPhase)}`}>
                    {timeLeft}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getPhaseInstructions(currentPhase)}
                  </div>
                </div>
              </div>
              
              {/* Progress Ring */}
              <div className="absolute inset-0 flex items-center justify-center">
                <ProgressRing 
                  progress={
                    ((getPhaseTime(currentPhase) - timeLeft) / getPhaseTime(currentPhase)) * 100
                  } 
                  size={140} 
                  strokeWidth={3} 
                  showLabel={false}
                />
              </div>
            </div>

            {/* Cycle Progress */}
            <div className="flex justify-center gap-2">
              {Array.from({ length: selectedTechnique.cycles }, (_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    i < currentCycle - 1 ? 'bg-success' :
                    i === currentCycle - 1 ? 'bg-primary' :
                    'bg-muted'
                  }`}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              {!isActive ? (
                <Button onClick={startSession} size="lg" className="bg-success hover:bg-success/90">
                  <Play className="w-5 h-5 mr-2" />
                  Start Session
                </Button>
              ) : (
                <>
                  <Button onClick={pauseSession} variant="outline" size="lg">
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </Button>
                  <Button onClick={resetSession} variant="outline" size="lg">
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Reset
                  </Button>
                </>
              )}
            </div>

            {/* Settings Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="text-muted-foreground"
            >
              <Settings className="w-4 h-4 mr-2" />
              {showSettings ? 'Hide' : 'Show'} Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Custom Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Inhale (seconds)</label>
                  <Slider
                    value={[customSettings.inhale]}
                    onValueChange={(value) => setCustomSettings(prev => ({ ...prev, inhale: value[0] }))}
                    max={10}
                    min={2}
                    step={1}
                    className="mt-2"
                  />
                  <div className="text-sm text-muted-foreground mt-1">{customSettings.inhale}s</div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Hold (seconds)</label>
                  <Slider
                    value={[customSettings.hold]}
                    onValueChange={(value) => setCustomSettings(prev => ({ ...prev, hold: value[0] }))}
                    max={10}
                    min={0}
                    step={1}
                    className="mt-2"
                  />
                  <div className="text-sm text-muted-foreground mt-1">{customSettings.hold}s</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Exhale (seconds)</label>
                  <Slider
                    value={[customSettings.exhale]}
                    onValueChange={(value) => setCustomSettings(prev => ({ ...prev, exhale: value[0] }))}
                    max={10}
                    min={2}
                    step={1}
                    className="mt-2"
                  />
                  <div className="text-sm text-muted-foreground mt-1">{customSettings.exhale}s</div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Cycles</label>
                  <Slider
                    value={[customSettings.cycles]}
                    onValueChange={(value) => setCustomSettings(prev => ({ ...prev, cycles: value[0] }))}
                    max={10}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                  <div className="text-sm text-muted-foreground mt-1">{customSettings.cycles} cycles</div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <label className="text-sm font-medium">Sound Effects</label>
              </div>
              <Switch
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>
            
            <Button onClick={updateCustomTechnique} className="w-full">
              Apply Custom Settings
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Session Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-md bg-gradient-to-br from-success to-accent">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Timer className="w-5 h-5 text-success" />
              <span className="text-lg font-semibold">Total Sessions</span>
            </div>
            <div className="text-2xl font-bold text-success">{totalSessions}</div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md bg-gradient-to-br from-primary to-mood-happy">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-lg font-semibold">Total Minutes</span>
            </div>
            <div className="text-2xl font-bold text-primary">{totalMinutes}</div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md bg-gradient-to-br from-accent to-success">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Award className="w-5 h-5 text-accent" />
              <span className="text-lg font-semibold">Current Streak</span>
            </div>
            <div className="text-2xl font-bold text-accent">
              {totalSessions > 0 ? Math.min(totalSessions, 7) : 0} days
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 