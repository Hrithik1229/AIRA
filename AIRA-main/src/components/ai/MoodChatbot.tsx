import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { aiService, type ChatMessage, type MoodAnalysis } from "@/services/ai-service";
import { historyService, type MoodEntry } from "@/services/history-service";
import { Bot, Clock, ExternalLink, Heart, Lightbulb, MessageCircle, RefreshCw, Send, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Typing effect component
interface TypingEffectProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

function TypingEffect({ text, speed = 30, className, onComplete }: TypingEffectProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
      // Call onComplete after a short delay to show the cursor briefly
      if (onComplete) {
        setTimeout(onComplete, 500);
      }
    }
  }, [currentIndex, text, speed, onComplete]);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
    setIsTyping(true);
  }, [text]);

  return (
    <div className={className}>
      <span>{displayedText}</span>
      {isTyping && (
        <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
      )}
    </div>
  );
}

// Helper function to format markdown-style text
const formatText = (text: string) => {
  return text
    .split('\n')
    .map((line, index) => {
      if (line.startsWith('• ')) {
        return <li key={index} className="ml-4">{line.substring(2)}</li>;
      } else if (line.startsWith('**') && line.endsWith('**')) {
        return <strong key={index} className="font-bold">{line.substring(2, line.length - 2)}</strong>;
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else {
        return <span key={index}>{line}</span>;
      }
    });
};

interface MoodChatbotProps {
  onMoodChange?: (mood: MoodAnalysis | null) => void;
}

export function MoodChatbot({ onMoodChange }: MoodChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hi! I'm AIRA, your personal daily life AI assistant. I'm here to chat, listen, and help you with whatever's on your mind. You can talk to me about anything - your day, your feelings, ask for recipes, get activity suggestions, or just have a casual conversation. If you want to track your mood, just let me know and I'll help you analyze how you're feeling! 💫",
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentMood, setCurrentMood] = useState<MoodAnalysis | null>(null);
  const [typingMessages, setTypingMessages] = useState<Set<string>>(new Set());
  const [moodHistory, setMoodHistory] = useState<MoodAnalysis[]>([]);
  const [conversationTheme, setConversationTheme] = useState<string>("general");
  const [showMoodHistory, setShowMoodHistory] = useState(false);
  const [showQuickMoods, setShowQuickMoods] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Notify parent component when mood changes
  useEffect(() => {
    if (onMoodChange) {
      onMoodChange(currentMood);
    }
  }, [currentMood, onMoodChange]);

  // Get mood-specific suggestions
  const getMoodSuggestions = (mood: string): string[] => {
    const suggestions: { [key: string]: string[] } = {
      Happy: ["Keep spreading that positive energy!", "Share your joy with others", "Savor this moment"],
      Sad: ["It's okay to feel sad", "Consider talking to someone you trust", "Try some gentle self-care"],
      Angry: ["Take a few deep breaths", "Express your feelings safely", "Consider what's really bothering you"],
      Anxious: ["Focus on your breathing", "You're safe in this moment", "Take things one step at a time"],
      Calm: ["Enjoy this peaceful state", "Use this calm energy wisely", "Share this tranquility with others"]
    };
    
    return suggestions[mood] || ["Your feelings are valid", "I'm here to listen", "Take care of yourself"];
  };

  // Add mood to history
  const addMoodToHistory = (mood: MoodAnalysis) => {
    setMoodHistory(prev => {
      const newHistory = [mood, ...prev.slice(0, 9)]; // Keep last 10 moods
      return newHistory;
    });
  };

  // Get mood trend
  const getMoodTrend = () => {
    if (moodHistory.length < 2) return "stable";
    const recentMoods = moodHistory.slice(0, 3);
    const positiveMoods = recentMoods.filter(m => 
      ['Happy', 'Calm', 'Excited', 'Grateful'].includes(m.primaryMood)
    ).length;
    const negativeMoods = recentMoods.filter(m => 
      ['Sad', 'Angry', 'Anxious', 'Stressed'].includes(m.primaryMood)
    ).length;
    
    if (positiveMoods > negativeMoods) return "improving";
    if (negativeMoods > positiveMoods) return "declining";
    return "stable";
  };

  // Quick mood buttons
  const quickMoods = [
    { label: "Happy", emoji: "😊", prompt: "I'm feeling happy and content today" },
    { label: "Stressed", emoji: "😰", prompt: "I'm feeling stressed and overwhelmed" },
    { label: "Sad", emoji: "😢", prompt: "I'm feeling sad and down" },
    { label: "Anxious", emoji: "😨", prompt: "I'm feeling anxious and worried" },
    { label: "Calm", emoji: "😌", prompt: "I'm feeling calm and peaceful" },
    { label: "Excited", emoji: "🤩", prompt: "I'm feeling excited and energetic" }
  ];

  // Conversation themes
  const conversationThemes = [
    { id: "general", label: "General Chat", icon: MessageCircle },
    { id: "stress", label: "Stress Relief", icon: Lightbulb },
    { id: "gratitude", label: "Gratitude", icon: Heart },
    { id: "goals", label: "Goal Setting", icon: TrendingUp },
    { id: "practical", label: "Practical Help", icon: Lightbulb }
  ];

  // Handle quick mood selection
  const handleQuickMood = (moodPrompt: string) => {
    setInputValue(moodPrompt);
    setShowQuickMoods(false);
  };

  // Handle theme change
  const handleThemeChange = (theme: string) => {
    setConversationTheme(theme);
    const themeMessages = {
      stress: "Let's focus on stress relief and relaxation techniques. What's been causing you stress lately?",
      gratitude: "Let's explore gratitude and positive thinking. What are you thankful for today?",
      goals: "Let's talk about your goals and aspirations. What would you like to achieve?",
      practical: "I'm here to help with practical tasks! Need a recipe, activity suggestions, or help organizing your day?",
      general: "I'm here for whatever you'd like to talk about. How are you feeling?"
    };
    
    const themeMessage: ChatMessage = {
      id: Date.now().toString(),
      text: themeMessages[theme as keyof typeof themeMessages] || themeMessages.general,
      sender: 'bot',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, themeMessage]);
    setTypingMessages(prev => new Set([...prev, themeMessage.id]));
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    aiService.addToHistory(userMessage);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await aiService.processMessage(inputValue);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        sender: 'bot',
        timestamp: new Date(),
        mood: response.moodAnalysis || undefined,
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Add typing effect to the new bot message
      setTypingMessages(prev => new Set([...prev, botMessage.id]));
      
      // Update current mood if mood analysis was provided
      if (response.moodAnalysis) {
        setCurrentMood(response.moodAnalysis);
        addMoodToHistory(response.moodAnalysis);
        
        // Save mood to history service
        const moodEntry: MoodEntry = {
          emoji: response.moodAnalysis.primaryMood === 'Happy' ? '😊' : 
                response.moodAnalysis.primaryMood === 'Sad' ? '😢' :
                response.moodAnalysis.primaryMood === 'Angry' ? '😠' :
                response.moodAnalysis.primaryMood === 'Anxious' ? '😨' :
                response.moodAnalysis.primaryMood === 'Calm' ? '😌' :
                response.moodAnalysis.primaryMood === 'Stressed' ? '😰' :
                response.moodAnalysis.primaryMood === 'Excited' ? '🤩' :
                response.moodAnalysis.primaryMood === 'Grateful' ? '🙏' :
                response.moodAnalysis.primaryMood === 'Lonely' ? '😔' :
                response.moodAnalysis.primaryMood === 'Depressed' ? '😞' : '😐',
          label: response.moodAnalysis.primaryMood,
          confidence: response.moodAnalysis.confidence || 0.8,
          timestamp: new Date(),
          context: inputValue
        };
        historyService.saveMoodToStorage(moodEntry);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble understanding right now. Could you try rephrasing that?",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setTypingMessages(prev => new Set([...prev, errorMessage.id]));
      aiService.addToHistory(errorMessage);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const removeTypingEffect = (messageId: string) => {
    setTypingMessages(prev => {
      const newSet = new Set(prev);
      newSet.delete(messageId);
      return newSet;
    });
  };

  const resetConversation = () => {
    setMessages([
      {
        id: '1',
        text: "Hi! I'm AIRA, your personal daily life AI assistant. I'm here to chat, listen, and help you with whatever's on your mind. You can talk to me about anything - your day, your feelings, ask for recipes, get activity suggestions, or just have a casual conversation. If you want to track your mood, just let me know and I'll help you analyze how you're feeling! 💫",
        sender: 'bot',
        timestamp: new Date(),
      }
    ]);
    setCurrentMood(null);
    setTypingMessages(new Set(['1'])); // Add typing effect to welcome message
    aiService.clearHistory();
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const isUnpleasantMood = (mood: string) => {
    return ['Sad', 'Stressed', 'Angry', 'Confused'].includes(mood);
  };

  return (
    <Card className="border-none shadow-md bg-gradient-to-br from-primary-soft to-accent">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-primary-foreground">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Personal Daily Life AI Assistant
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetConversation}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Conversation Themes */}
          <div className="flex flex-wrap gap-2">
            {conversationThemes.map((theme) => {
              const IconComponent = theme.icon;
              return (
                <Button
                  key={theme.id}
                  variant={conversationTheme === theme.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleThemeChange(theme.id)}
                  className="flex items-center gap-2"
                >
                  <IconComponent className="w-3 h-3" />
                  {theme.label}
                </Button>
              );
            })}
          </div>

          {/* Quick Mood Buttons */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Quick Mood Check</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQuickMoods(!showQuickMoods)}
                className="text-xs"
              >
                {showQuickMoods ? "Hide" : "Show"}
              </Button>
            </div>
            {showQuickMoods && (
              <div className="grid grid-cols-3 gap-2">
                {quickMoods.map((mood) => (
                  <Button
                    key={mood.label}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickMood(mood.prompt)}
                    className="flex flex-col items-center gap-1 h-auto py-2"
                  >
                    <span className="text-lg">{mood.emoji}</span>
                    <span className="text-xs">{mood.label}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Chat Messages */}
          <div className="h-64 overflow-y-auto space-y-3 p-2 border border-border/20 rounded-lg bg-background/50 scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-primary/5 hover:scrollbar-thumb-primary/50 scrollbar-thumb-rounded-full transition-all duration-300">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2",
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] p-3 rounded-lg",
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  )}
                >
                  <div className="flex items-start gap-2">
                    {message.sender === 'bot' && (
                      <Bot className="w-4 h-4 mt-1 flex-shrink-0" />
                    )}
                    <div className="text-sm leading-relaxed">
                      {message.sender === 'bot' && message.mood?.formattedResponse ? (
                        <div className="space-y-2">
                                                  {typingMessages.has(message.id) ? (
                          <TypingEffect 
                            text={message.mood.formattedResponse} 
                            speed={25}
                            className="whitespace-pre-wrap"
                            onComplete={() => removeTypingEffect(message.id)}
                          />
                        ) : (
                          <div className="whitespace-pre-wrap">{message.mood.formattedResponse}</div>
                        )}
                        </div>
                      ) : (
                        typingMessages.has(message.id) ? (
                          <TypingEffect 
                            text={message.text} 
                            speed={25}
                            className="whitespace-pre-wrap"
                            onComplete={() => removeTypingEffect(message.id)}
                          />
                        ) : (
                          <div className="whitespace-pre-wrap">{message.text}</div>
                        )
                      )}
                    </div>
                  </div>
                  {message.mood && (
                    <div className="mt-2 text-xs opacity-75">
                      Detected mood: {message.mood.primaryMood} ({Math.round((message.mood.confidence || 0) * 100)}%)
                      {message.mood.intensity && (
                        <span className={cn("ml-2", getIntensityColor(message.mood.intensity))}>
                          • {message.mood.intensity} intensity
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-2 justify-start">
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    <LoadingSpinner size="sm" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Current Mood Display - Only show when mood analysis is provided */}
          {currentMood && (
            <div className="p-3 bg-background/50 rounded-lg border border-border/20">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-primary" />
                <span className="text-2xl">{currentMood.emoji}</span>
                <span className="font-semibold text-foreground">
                  Mood Analysis: {currentMood.primaryMood}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({Math.round(currentMood.confidence * 100)}% confidence)
                </span>
                <span className={cn("text-xs font-medium", getIntensityColor(currentMood.intensity))}>
                  {currentMood.intensity} intensity
                </span>
              </div>
              
              {currentMood.triggers && currentMood.triggers.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs text-muted-foreground">Possible triggers: </span>
                  <span className="text-xs text-primary">
                    {currentMood.triggers.join(', ')}
                  </span>
                </div>
              )}
              
              {currentMood.secondaryMoods && currentMood.secondaryMoods.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs text-muted-foreground">Also detected: </span>
                  <span className="text-xs text-secondary-foreground">
                    {currentMood.secondaryMoods.join(', ')}
                  </span>
                </div>
              )}

              {/* Resources for unpleasant moods */}
              {isUnpleasantMood(currentMood.primaryMood) && currentMood.resources && currentMood.resources.length > 0 && (
                <div className="mt-3 p-2 bg-warning/10 rounded-lg border border-warning/20">
                  <h4 className="text-xs font-medium text-warning-foreground mb-2">
                    💡 Helpful Resources
                  </h4>
                  <div className="space-y-1">
                    {currentMood.resources.map((resource, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <ExternalLink className="w-3 h-3 text-warning" />
                        <span className="text-xs text-warning-foreground">{resource}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mood History & Trends */}
          {moodHistory.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Mood History</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {getMoodTrend()}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMoodHistory(!showMoodHistory)}
                    className="text-xs"
                  >
                    {showMoodHistory ? "Hide" : "Show"}
                  </Button>
                </div>
              </div>
              
              {showMoodHistory && (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {moodHistory.map((mood, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-background/30 rounded-lg border border-border/20">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{mood.emoji}</span>
                        <span className="text-sm font-medium">{mood.primaryMood}</span>
                        <span className="text-xs text-muted-foreground">
                          {Math.round((mood.confidence || 0) * 100)}%
                        </span>
                      </div>
                      <span className={cn("text-xs font-medium", getIntensityColor(mood.intensity))}>
                        {mood.intensity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Input */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Chat with me about anything..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-4">
                <span>💡 Chat naturally, express your mood, or ask for help</span>
                <span>📊 {moodHistory.length} mood entries tracked</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span>Examples:</span>
                <span className="text-primary">"I'm feeling overwhelmed"</span>
                <span>•</span>
                <span className="text-primary">"What should I do today?"</span>
                <span>•</span>
                <span className="text-primary">"Recipe for pasta"</span>
                <span>•</span>
                <span className="text-primary">"Help me organize my day"</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 