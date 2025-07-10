import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/ui/Logo";
import { SplashCursor } from "@/components/ui/splash-cursor";
import { ArrowRight, Brain, Heart, Pause, Play, Sparkles, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface LandingProps {
  onEnterApp: () => void;
}

export function Landing({ onEnterApp }: LandingProps) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isEntering, setIsEntering] = useState(false);

  const handleEnterApp = () => {
    setIsEntering(true);
    // Add a small delay for the animation
    setTimeout(() => {
      onEnterApp();
    }, 800);
  };

  const toggleVideo = () => {
    const video = document.getElementById('background-video') as HTMLVideoElement;
    if (video) {
      if (isVideoPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  useEffect(() => {
    const video = document.getElementById('background-video') as HTMLVideoElement;
    if (video) {
      video.addEventListener('loadeddata', () => setIsVideoLoaded(true));
      video.addEventListener('ended', () => video.play()); // Loop the video
    }
  }, []);

  return (
    <>
      <SplashCursor />
      <div className="relative min-h-screen overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            id="background-video"
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.3) contrast(1.2)' }}
          >
            <source src="/aibot.mp4" type="video/mp4" />
          </video>
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Header */}
          <header className="flex justify-between items-center p-6">
            <Logo size="md" variant="default" className="text-white" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleVideo}
              className="text-white hover:bg-white/10"
            >
              {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </header>

          {/* Main Content */}
          <main className="flex-1 flex items-center justify-center px-6">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              {/* Hero Section */}
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <Logo size="hero" variant="hero" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-success rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                  Your AI-Powered
                  <br />
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Cognitive Wellness
                  </span>
                  <br />
                  Guide
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  Experience a revolutionary approach to mental health with AI-driven mood analysis, 
                  intelligent task management, and personalized wellness insights.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Heart className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">AI Mood Analysis</h3>
                    <p className="text-gray-300 text-sm">
                      Advanced AI chatbot that understands your emotions and provides personalized support.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Zap className="w-6 h-6 text-success" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Smart Task Management</h3>
                    <p className="text-gray-300 text-sm">
                      Intelligent task organization with natural language processing and priority tracking.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Brain className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Wellness Insights</h3>
                    <p className="text-gray-300 text-sm">
                      Track your progress, discover patterns, and celebrate your mental health journey.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Call to Action */}
              <div className="space-y-6">
                <Button
                  onClick={handleEnterApp}
                  disabled={isEntering}
                  size="lg"
                  className={`
                    text-lg px-8 py-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90
                    text-white font-semibold rounded-full shadow-2xl hover:shadow-primary/25
                    transform transition-all duration-300 hover:scale-105
                    ${isEntering ? 'animate-pulse' : ''}
                  `}
                >
                  {isEntering ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                      Entering AIRA...
                    </>
                  ) : (
                    <>
                      Start Your Journey
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
                
                <p className="text-gray-400 text-sm">
                  Join thousands of users who have transformed their mental wellness
                </p>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="p-6 text-center">
            <p className="text-gray-400 text-sm">
              Project developed by Team OLYMPUS for IEDC Vibe Coding Hackathon
            </p>
          </footer>
        </div>

        {/* Loading Overlay */}
        {!isVideoLoaded && (
          <div className="absolute inset-0 z-20 bg-black flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white text-lg">Loading AIRA...</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 