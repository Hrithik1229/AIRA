import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

interface VoiceCommand {
  command: string;
  description: string;
  action: () => void;
  keywords: string[];
  patterns: RegExp[];
  responses: string[];
}

interface VoiceAssistantProps {
  onQuickMood?: (mood: string) => void;
  onQuickTask?: (task: string) => void;
  onStartBreathing?: () => void;
  onStopBreathing?: () => void;
}

export function VoiceAssistant({ 
  onQuickMood, 
  onQuickTask, 
  onStartBreathing, 
  onStopBreathing 
}: VoiceAssistantProps) {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [lastCommand, setLastCommand] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationContext, setConversationContext] = useState<string[]>([]);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  // Enhanced voice commands with conversational patterns
  const voiceCommands: VoiceCommand[] = [
    // Greetings and conversational responses
    {
      command: "Greeting",
      description: "Respond to greetings naturally",
      keywords: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "howdy", "what's up"],
      patterns: [
        /^(hi|hello|hey|howdy|what's up|sup)\b/i,
        /^good\s+(morning|afternoon|evening)\b/i,
        /^how\s+are\s+you\b/i,
        /^how\s+you\s+doing\b/i
      ],
      responses: [
        "Hello! How can I help you today?",
        "Hi there! What would you like to do?",
        "Hey! I'm here to help. What's on your mind?",
        "Good to see you! How are you feeling today?",
        "Hello! Ready to make today amazing?"
      ],
      action: () => {
        const response = voiceCommands[0].responses[Math.floor(Math.random() * voiceCommands[0].responses.length)];
        speak(response);
      }
    },
    {
      command: "Farewell",
      description: "Respond to goodbyes",
      keywords: ["bye", "goodbye", "see you", "later", "thanks", "thank you"],
      patterns: [
        /^(bye|goodbye|see\s+you|later|farewell)\b/i,
        /^thank\s+(you|u)\b/i,
        /^thanks\b/i
      ],
      responses: [
        "Goodbye! Take care!",
        "See you later! Have a great day!",
        "You're welcome! Come back anytime!",
        "Bye! Remember to take care of yourself!",
        "Thanks for using AIRA! See you soon!"
      ],
      action: () => {
        const response = voiceCommands[1].responses[Math.floor(Math.random() * voiceCommands[1].responses.length)];
        speak(response);
      }
    },
    // Navigation commands
    {
      command: "Navigate to dashboard",
      description: "Go to the main dashboard",
      keywords: ["dashboard", "home", "main", "go home", "take me home"],
      patterns: [
        /^(go\s+to\s+)?(dashboard|home|main)\b/i,
        /^take\s+me\s+(home|to\s+dashboard)\b/i,
        /^show\s+(me\s+)?(the\s+)?dashboard\b/i
      ],
      responses: ["Taking you to the dashboard", "Going to your main dashboard", "Here's your dashboard"],
      action: () => {
        navigate("/");
        speak("Taking you to the dashboard");
      }
    },
    {
      command: "Navigate to tasks",
      description: "Go to the tasks page",
      keywords: ["tasks", "task", "to do", "todo", "my tasks"],
      patterns: [
        /^(go\s+to\s+)?(tasks?|to\s+do|todo)\b/i,
        /^show\s+(me\s+)?(my\s+)?tasks?\b/i,
        /^open\s+(my\s+)?tasks?\b/i
      ],
      responses: ["Opening your tasks", "Taking you to your task list", "Here are your tasks"],
      action: () => {
        navigate("/tasks");
        speak("Opening your tasks");
      }
    },
    {
      command: "Navigate to mood",
      description: "Go to the mood tracking page",
      keywords: ["mood", "feelings", "emotion", "how i feel"],
      patterns: [
        /^(go\s+to\s+)?(mood|feelings?|emotions?)\b/i,
        /^how\s+(am\s+i\s+)?feeling\b/i,
        /^track\s+(my\s+)?mood\b/i
      ],
      responses: ["Opening mood tracking", "Let's check how you're feeling", "Taking you to mood tracking"],
      action: () => {
        navigate("/mood");
        speak("Opening mood tracking");
      }
    },
    {
      command: "Navigate to wellness",
      description: "Go to the wellness page",
      keywords: ["wellness", "health", "meditation", "breathing"],
      patterns: [
        /^(go\s+to\s+)?(wellness|health|meditation)\b/i,
        /^show\s+(me\s+)?wellness\b/i,
        /^open\s+wellness\b/i
      ],
      responses: ["Opening wellness activities", "Taking you to wellness", "Here are your wellness options"],
      action: () => {
        navigate("/wellness");
        speak("Opening wellness activities");
      }
    },
    {
      command: "Navigate to analytics",
      description: "Go to the analytics page",
      keywords: ["analytics", "stats", "statistics", "data"],
      patterns: [
        /^(go\s+to\s+)?(analytics|stats?|statistics|data)\b/i,
        /^show\s+(me\s+)?(my\s+)?(analytics|stats?)\b/i
      ],
      responses: ["Opening your analytics", "Taking you to your stats", "Here are your insights"],
      action: () => {
        navigate("/analytics");
        speak("Opening your analytics");
      }
    },
    {
      command: "Navigate to settings",
      description: "Go to the settings page",
      keywords: ["settings", "preferences", "config"],
      patterns: [
        /^(go\s+to\s+)?(settings?|preferences?|config)\b/i,
        /^open\s+(my\s+)?settings?\b/i
      ],
      responses: ["Opening settings", "Taking you to settings", "Here are your preferences"],
      action: () => {
        navigate("/settings");
        speak("Opening settings");
      }
    },
    // Emotional expressions and mood logging
    {
      command: "Log mood happy",
      description: "Log your mood as happy",
      keywords: ["happy", "good", "great", "excellent", "joyful", "amazing", "wonderful", "fantastic"],
      patterns: [
        /^(i\s+(feel|am)\s+)?(happy|good|great|excellent|joyful|amazing|wonderful|fantastic)\b/i,
        /^(feeling\s+)?(happy|good|great|excellent|joyful|amazing|wonderful|fantastic)\b/i,
        /^(i'm\s+)?(happy|good|great|excellent|joyful|amazing|wonderful|fantastic)\b/i
      ],
      responses: [
        "That's wonderful! I'm glad you're feeling happy",
        "Great to hear you're in a good mood!",
        "Happiness is contagious! Thanks for sharing",
        "That's fantastic! Keep that positive energy going"
      ],
      action: () => {
        onQuickMood?.("Happy");
        const response = voiceCommands[7].responses[Math.floor(Math.random() * voiceCommands[7].responses.length)];
        speak(response);
      }
    },
    {
      command: "Log mood sad",
      description: "Log your mood as sad",
      keywords: ["sad", "down", "depressed", "unhappy", "blue", "melancholy"],
      patterns: [
        /^(i\s+(feel|am)\s+)?(sad|down|depressed|unhappy|blue|melancholy)\b/i,
        /^(feeling\s+)?(sad|down|depressed|unhappy|blue|melancholy)\b/i,
        /^(i'm\s+)?(sad|down|depressed|unhappy|blue|melancholy)\b/i
      ],
      responses: [
        "I'm sorry you're feeling down. It's okay to feel this way",
        "I hear you. Would you like to talk about it?",
        "It's normal to feel sad sometimes. I'm here for you",
        "Thank you for sharing that with me. How can I help?"
      ],
      action: () => {
        onQuickMood?.("Sad");
        const response = voiceCommands[8].responses[Math.floor(Math.random() * voiceCommands[8].responses.length)];
        speak(response);
      }
    },
    {
      command: "Log mood calm",
      description: "Log your mood as calm",
      keywords: ["calm", "peaceful", "relaxed", "serene", "chill", "at ease"],
      patterns: [
        /^(i\s+(feel|am)\s+)?(calm|peaceful|relaxed|serene|chill|at\s+ease)\b/i,
        /^(feeling\s+)?(calm|peaceful|relaxed|serene|chill|at\s+ease)\b/i,
        /^(i'm\s+)?(calm|peaceful|relaxed|serene|chill|at\s+ease)\b/i
      ],
      responses: [
        "That's a beautiful state of mind. Enjoy the peace",
        "Calm is such a wonderful feeling. Treasure it",
        "Peaceful moments are precious. Good for you",
        "That serenity sounds lovely. Keep it going"
      ],
      action: () => {
        onQuickMood?.("Calm");
        const response = voiceCommands[9].responses[Math.floor(Math.random() * voiceCommands[9].responses.length)];
        speak(response);
      }
    },
    {
      command: "Log mood stressed",
      description: "Log your mood as stressed",
      keywords: ["stressed", "anxious", "worried", "tense", "overwhelmed", "frazzled"],
      patterns: [
        /^(i\s+(feel|am)\s+)?(stressed|anxious|worried|tense|overwhelmed|frazzled)\b/i,
        /^(feeling\s+)?(stressed|anxious|worried|tense|overwhelmed|frazzled)\b/i,
        /^(i'm\s+)?(stressed|anxious|worried|tense|overwhelmed|frazzled)\b/i
      ],
      responses: [
        "I understand stress can be overwhelming. Let's take a moment to breathe",
        "It's okay to feel stressed. Would you like to try a breathing exercise?",
        "Stress is tough. I'm here to help you through it",
        "Let's work through this together. What's causing the stress?"
      ],
      action: () => {
        onQuickMood?.("Stressed");
        const response = voiceCommands[10].responses[Math.floor(Math.random() * voiceCommands[10].responses.length)];
        speak(response);
      }
    },
    {
      command: "Log mood excited",
      description: "Log your mood as excited",
      keywords: ["excited", "thrilled", "pumped", "energized", "enthusiastic"],
      patterns: [
        /^(i\s+(feel|am)\s+)?(excited|thrilled|pumped|energized|enthusiastic)\b/i,
        /^(feeling\s+)?(excited|thrilled|pumped|energized|enthusiastic)\b/i,
        /^(i'm\s+)?(excited|thrilled|pumped|energized|enthusiastic)\b/i
      ],
      responses: [
        "That excitement is contagious! What's got you so pumped?",
        "Love that energy! Channel it into something great",
        "Excitement is such a powerful emotion. Enjoy it!",
        "That enthusiasm is amazing! Keep that fire burning"
      ],
      action: () => {
        onQuickMood?.("Excited");
        const response = voiceCommands[11].responses[Math.floor(Math.random() * voiceCommands[11].responses.length)];
        speak(response);
      }
    },
    // Wellness commands
    {
      command: "Start breathing",
      description: "Start a breathing exercise",
      keywords: ["breathing", "breathe", "meditation", "relax", "calm down"],
      patterns: [
        /^(start\s+)?(breathing|breathe|meditation)\b/i,
        /^(i\s+need\s+to\s+)?(relax|calm\s+down)\b/i,
        /^(help\s+me\s+)?(relax|calm\s+down)\b/i
      ],
      responses: [
        "Let's take a moment to breathe together",
        "I'll guide you through a breathing exercise",
        "Time to relax and focus on your breath",
        "Let's start a calming breathing session"
      ],
      action: () => {
        onStartBreathing?.();
        const response = voiceCommands[12].responses[Math.floor(Math.random() * voiceCommands[12].responses.length)];
        speak(response);
      }
    },
    {
      command: "Stop breathing",
      description: "Stop the current breathing exercise",
      keywords: ["stop breathing", "end breathing", "finish breathing"],
      patterns: [
        /^(stop|end|finish)\s+(breathing|meditation)\b/i,
        /^(i'm\s+)?done\s+(breathing|meditating)\b/i
      ],
      responses: ["Ending the breathing session", "Great job with the breathing exercise", "Session complete"],
      action: () => {
        onStopBreathing?.();
        speak("Ending the breathing session");
      }
    },
    // Task management
    {
      command: "Add task",
      description: "Add a new task (speak the task after)",
      keywords: ["add task", "new task", "create task", "task"],
      patterns: [
        /^(add|create|new)\s+task\b/i,
        /^(i\s+need\s+to\s+)?(add|create)\s+(a\s+)?task\b/i
      ],
      responses: ["What task would you like to add?", "Tell me what task to add", "What's the task?"],
      action: () => {
        const response = voiceCommands[14].responses[Math.floor(Math.random() * voiceCommands[14].responses.length)];
        speak(response);
      }
    },
    // Help and control
    {
      command: "Show commands",
      description: "Show available voice commands",
      keywords: ["commands", "help", "what can you do", "voice commands"],
      patterns: [
        /^(show\s+)?(commands?|help)\b/i,
        /^what\s+(can\s+you\s+)?do\b/i,
        /^how\s+(do\s+i\s+)?use\s+(voice|this)\b/i
      ],
      responses: ["Here are the commands you can use", "Let me show you what I can do", "Here's how to use voice commands"],
      action: () => {
        setShowCommands(true);
        speak("Here are the commands you can use");
      }
    },
    {
      command: "Hide commands",
      description: "Hide the commands list",
      keywords: ["hide", "close", "go away"],
      patterns: [
        /^(hide|close)\s+(commands?|help)\b/i,
        /^go\s+away\b/i,
        /^stop\s+showing\s+(commands?|help)\b/i
      ],
      responses: ["Hiding the commands", "Commands hidden", "Got it"],
      action: () => {
        setShowCommands(false);
        speak("Hiding the commands");
      }
    }
  ];

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    const SpeechSynthesis = window.speechSynthesis;
    
    if (SpeechRecognition && SpeechSynthesis) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      synthesisRef.current = SpeechSynthesis;
      
      // Configure speech recognition
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      // Set up event handlers
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setTranscript("");
        setConfidence(0);
      };
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
        if (event.results.length > 0) {
          setConfidence(event.results[event.results.length - 1][0].confidence);
        }
        
        // Process final results
        if (finalTranscript) {
          processVoiceCommand(finalTranscript.toLowerCase());
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsProcessing(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
        setIsProcessing(false);
      };
    }
  }, []);

  const processVoiceCommand = (spokenText: string) => {
    setIsProcessing(true);
    
    // Add to conversation context
    setConversationContext(prev => [...prev.slice(-4), spokenText]);
    
    // Check for task creation (more flexible)
    if (spokenText.includes("task") && !spokenText.includes("add task") && !spokenText.includes("show tasks")) {
      const taskText = spokenText.replace(/\b(task|add|create|new|remind|reminder)\b/gi, "").trim();
      if (taskText && taskText.length > 3) {
        onQuickTask?.(taskText);
        speak(`Task "${taskText}" has been added to your list`);
        setLastCommand(`Added task: ${taskText}`);
        setIsProcessing(false);
        return;
      }
    }
    
    // Check for emotional expressions and mood logging
    const moodPatterns = [
      { pattern: /\b(happy|good|great|excellent|joyful|amazing|wonderful|fantastic)\b/i, mood: "Happy" },
      { pattern: /\b(sad|down|depressed|unhappy|blue|melancholy)\b/i, mood: "Sad" },
      { pattern: /\b(calm|peaceful|relaxed|serene|chill|at\s+ease)\b/i, mood: "Calm" },
      { pattern: /\b(stressed|anxious|worried|tense|overwhelmed|frazzled)\b/i, mood: "Stressed" },
      { pattern: /\b(excited|thrilled|pumped|energized|enthusiastic)\b/i, mood: "Excited" }
    ];
    
    for (const moodPattern of moodPatterns) {
      if (moodPattern.pattern.test(spokenText)) {
        onQuickMood?.(moodPattern.mood);
        const responses = {
          "Happy": ["That's wonderful! I'm glad you're feeling happy", "Great to hear you're in a good mood!"],
          "Sad": ["I'm sorry you're feeling down. It's okay to feel this way", "I hear you. Would you like to talk about it?"],
          "Calm": ["That's a beautiful state of mind. Enjoy the peace", "Calm is such a wonderful feeling. Treasure it"],
          "Stressed": ["I understand stress can be overwhelming. Let's take a moment to breathe", "It's okay to feel stressed. Would you like to try a breathing exercise?"],
          "Excited": ["That excitement is contagious! What's got you so pumped?", "Love that energy! Channel it into something great"]
        };
        const moodResponses = responses[moodPattern.mood as keyof typeof responses];
        const response = moodResponses[Math.floor(Math.random() * moodResponses.length)];
        speak(response);
        setLastCommand(`Logged mood: ${moodPattern.mood}`);
        setIsProcessing(false);
        return;
      }
    }
    
    // Check for conversational patterns first
    for (const command of voiceCommands) {
      for (const pattern of command.patterns) {
        if (pattern.test(spokenText)) {
          command.action();
          setLastCommand(command.command);
          setIsProcessing(false);
          return;
        }
      }
    }
    
    // Fallback: Check for keyword matches
    for (const command of voiceCommands) {
      for (const keyword of command.keywords) {
        if (spokenText.includes(keyword)) {
          command.action();
          setLastCommand(command.command);
          setIsProcessing(false);
          return;
        }
      }
    }
    
    // No command found - provide helpful response
    const fallbackResponses = [
      "I didn't quite catch that. Could you try again?",
      "I'm not sure I understood. You can say 'show commands' to see what I can do.",
      "I didn't recognize that command. Try saying 'help' to see available options.",
      "I'm still learning! Say 'show commands' to see what I can help you with."
    ];
    const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    speak(fallbackResponse);
    setLastCommand("Command not recognized");
    setIsProcessing(false);
  };

  const speak = (text: string) => {
    if (synthesisRef.current) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      synthesisRef.current.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const toggleSpeaking = () => {
    if (synthesisRef.current) {
      if (isSpeaking) {
        synthesisRef.current.cancel();
        setIsSpeaking(false);
      } else {
        speak("Hello! I'm AIRA, your personal AI assistant. How can I help you today?");
      }
    }
  };

  if (!isSupported) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Voice Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Voice assistant is not supported in your browser. Please use Chrome, Edge, or Safari.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Voice Assistant
            <Badge variant={isListening ? "default" : "secondary"}>
              {isListening ? "Listening" : "Ready"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls */}
          <div className="flex gap-2">
            <Button
              onClick={toggleListening}
              variant={isListening ? "destructive" : "default"}
              className="flex-1"
              disabled={isProcessing}
            >
              {isListening ? (
                <>
                  <MicOff className="h-4 w-4 mr-2" />
                  Stop Listening
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Start Listening
                </>
              )}
            </Button>
            
            <Button
              onClick={toggleSpeaking}
              variant={isSpeaking ? "destructive" : "outline"}
              size="icon"
            >
              {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            
            <Button
              onClick={() => setShowCommands(!showCommands)}
              variant="outline"
              size="icon"
            >
              <Command className="h-4 w-4" />
            </Button>
          </div>

          {/* Status */}
          {isProcessing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              Processing command...
            </div>
          )}

          {/* Transcript */}
          {transcript && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">You said:</p>
              <p className="text-sm">{transcript}</p>
              {confidence > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Confidence: {Math.round(confidence * 100)}%
                </p>
              )}
            </div>
          )}

          {/* Last Command */}
          {lastCommand && (
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm font-medium mb-1">Last Action:</p>
              <p className="text-sm">{lastCommand}</p>
            </div>
          )}

          {/* Voice Commands List */}
          {showCommands && (
            <div className="space-y-2">
              <h4 className="font-medium">Available Voice Commands:</h4>
              <div className="grid gap-2 max-h-60 overflow-y-auto">
                {voiceCommands.map((cmd, index) => (
                  <div key={index} className="p-2 bg-muted rounded text-sm">
                    <p className="font-medium">{cmd.command}</p>
                    <p className="text-muted-foreground text-xs">{cmd.description}</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Keywords: {cmd.keywords.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 