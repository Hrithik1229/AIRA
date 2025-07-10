import {
    ArrowLeft,
    ArrowRight,
    Brain,
    Heart,
    List,
    MessageSquare,
    Sparkles,
    Target,
    X
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: string;
}

interface WelcomeTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeTour({ isOpen, onClose }: WelcomeTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const tourSteps: TourStep[] = [
    {
      id: "welcome",
      title: "Welcome to AIRA! 👋",
      description: "Your AI-powered personal daily life assistant. Let me show you around and help you get started with your daily life management journey.",
      icon: Brain
    },
    {
      id: "mood",
      title: "Track Your Mood 💭",
      description: "Chat with AIRA to analyze your emotions and get personalized insights. Your mood data helps us provide better recommendations.",
      icon: Heart
    },
    {
      id: "tasks",
      title: "Smart Task Management 📋",
      description: "Organize your life with intelligent task management. Use natural language to add tasks and let AIRA help you prioritize.",
      icon: List
    },
    {
      id: "goals",
      title: "Set & Achieve Goals 🎯",
      description: "Define your wellness and productivity goals. Track your progress and celebrate your achievements with AIRA's guidance.",
      icon: Target
    },
    {
      id: "wellness",
      title: "Wellness Activities 🧘‍♀️",
      description: "Access guided breathing exercises, meditation timers, and wellness challenges to support your mental health journey.",
      icon: Sparkles
    },
    {
      id: "chat",
      title: "Personal Daily Life AI Assistant 💬",
      description: "AIRA is always here to chat, listen, and support you. Whether you need advice, motivation, or just someone to talk to.",
      icon: MessageSquare
    }
  ];

  const currentTourStep = tourSteps[currentStep];

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    localStorage.setItem('aira-tour-completed', 'true');
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-2xl border-0 bg-background/95 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {currentTourStep.icon && <currentTourStep.icon className="w-5 h-5 text-primary" />}
              {currentTourStep.title}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={skipTour}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            {currentTourStep.description}
          </p>

          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Step {currentStep + 1} of {tourSteps.length}</span>
              <span>{Math.round(((currentStep + 1) / tourSteps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <Button
              onClick={nextStep}
              className="flex items-center gap-2"
            >
              {currentStep === tourSteps.length - 1 ? (
                <>
                  Get Started
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          {/* Skip Option */}
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={skipTour}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip tour
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 