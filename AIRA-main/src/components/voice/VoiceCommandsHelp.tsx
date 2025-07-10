import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, Command, Heart, MessageCircle, Mic, Navigation, Timer, Volume2 } from "lucide-react";
import { useState } from "react";

interface VoiceCommand {
  category: string;
  commands: {
    command: string;
    description: string;
    keywords: string[];
    example: string;
    patterns: string[];
  }[];
  icon: React.ReactNode;
  color: string;
}

const voiceCommands: VoiceCommand[] = [
  {
    category: "Conversation",
    icon: <MessageCircle className="w-5 h-5" />,
    color: "from-indigo-500 to-purple-500",
    commands: [
      {
        command: "Greetings",
        description: "Respond to natural greetings",
        keywords: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "howdy", "what's up"],
        patterns: ["Hi", "Hello", "Hey", "Good morning", "How are you?", "What's up?"],
        example: "Hey AIRA, how are you?"
      },
      {
        command: "Farewells",
        description: "Respond to goodbyes and thanks",
        keywords: ["bye", "goodbye", "see you", "later", "thanks", "thank you"],
        patterns: ["Bye", "Goodbye", "See you later", "Thank you", "Thanks"],
        example: "Thanks AIRA, see you later!"
      }
    ]
  },
  {
    category: "Navigation",
    icon: <Navigation className="w-5 h-5" />,
    color: "from-blue-500 to-cyan-500",
    commands: [
      {
        command: "Go to dashboard",
        description: "Navigate to the main dashboard",
        keywords: ["dashboard", "home", "main", "go home", "take me home"],
        patterns: ["Go to dashboard", "Take me home", "Show me the dashboard", "Go home"],
        example: "Hey AIRA, take me to the dashboard"
      },
      {
        command: "Go to tasks",
        description: "Navigate to the tasks page",
        keywords: ["tasks", "task", "to do", "todo", "my tasks"],
        patterns: ["Go to tasks", "Show my tasks", "Open tasks", "My to-do list"],
        example: "Hey AIRA, show me my tasks"
      },
      {
        command: "Go to mood",
        description: "Navigate to the mood tracking page",
        keywords: ["mood", "feelings", "emotion", "how i feel"],
        patterns: ["Go to mood", "How am I feeling?", "Track my mood", "My feelings"],
        example: "Hey AIRA, how am I feeling today?"
      },
      {
        command: "Go to wellness",
        description: "Navigate to the wellness page",
        keywords: ["wellness", "health", "meditation", "breathing"],
        patterns: ["Go to wellness", "Show wellness", "Open wellness", "Health activities"],
        example: "Hey AIRA, open wellness activities"
      },
      {
        command: "Go to analytics",
        description: "Navigate to the analytics page",
        keywords: ["analytics", "stats", "statistics", "data"],
        patterns: ["Go to analytics", "Show my stats", "My analytics", "View data"],
        example: "Hey AIRA, show me my analytics"
      },
      {
        command: "Go to settings",
        description: "Navigate to the settings page",
        keywords: ["settings", "preferences", "config"],
        patterns: ["Go to settings", "Open settings", "My preferences", "Configuration"],
        example: "Hey AIRA, open my settings"
      }
    ]
  },
  {
    category: "Mood & Emotions",
    icon: <Heart className="w-5 h-5" />,
    color: "from-pink-500 to-rose-500",
    commands: [
      {
        command: "I'm happy",
        description: "Log your mood as happy",
        keywords: ["happy", "good", "great", "excellent", "joyful", "amazing", "wonderful", "fantastic"],
        patterns: ["I'm happy", "I feel good", "I'm feeling great", "I'm amazing", "I'm wonderful"],
        example: "Hey AIRA, I'm feeling really happy today!"
      },
      {
        command: "I'm sad",
        description: "Log your mood as sad",
        keywords: ["sad", "down", "depressed", "unhappy", "blue", "melancholy"],
        patterns: ["I'm sad", "I feel down", "I'm feeling blue", "I'm unhappy", "I'm depressed"],
        example: "Hey AIRA, I'm feeling a bit sad"
      },
      {
        command: "I'm calm",
        description: "Log your mood as calm",
        keywords: ["calm", "peaceful", "relaxed", "serene", "chill", "at ease"],
        patterns: ["I'm calm", "I feel peaceful", "I'm relaxed", "I'm at ease", "I'm serene"],
        example: "Hey AIRA, I'm feeling really calm right now"
      },
      {
        command: "I'm stressed",
        description: "Log your mood as stressed",
        keywords: ["stressed", "anxious", "worried", "tense", "overwhelmed", "frazzled"],
        patterns: ["I'm stressed", "I feel anxious", "I'm worried", "I'm overwhelmed", "I'm tense"],
        example: "Hey AIRA, I'm feeling really stressed out"
      },
      {
        command: "I'm excited",
        description: "Log your mood as excited",
        keywords: ["excited", "thrilled", "pumped", "energized", "enthusiastic"],
        patterns: ["I'm excited", "I feel thrilled", "I'm pumped", "I'm energized", "I'm enthusiastic"],
        example: "Hey AIRA, I'm so excited about today!"
      }
    ]
  },
  {
    category: "Task Management",
    icon: <CheckSquare className="w-5 h-5" />,
    color: "from-green-500 to-emerald-500",
    commands: [
      {
        command: "Add task",
        description: "Add a new task to your list",
        keywords: ["add task", "new task", "create task", "task"],
        patterns: ["Add task", "Create task", "New task", "I need to add a task"],
        example: "Hey AIRA, add task buy groceries"
      },
      {
        command: "What are my tasks",
        description: "Check your current tasks",
        keywords: ["what are my tasks", "show tasks", "list tasks"],
        patterns: ["What are my tasks?", "Show my tasks", "List my tasks", "My to-do list"],
        example: "Hey AIRA, what are my tasks?"
      }
    ]
  },
  {
    category: "Wellness",
    icon: <Timer className="w-5 h-5" />,
    color: "from-purple-500 to-violet-500",
    commands: [
      {
        command: "Start breathing",
        description: "Start a breathing exercise",
        keywords: ["breathing", "breathe", "meditation", "relax", "calm down"],
        patterns: ["Start breathing", "I need to relax", "Help me calm down", "Start meditation"],
        example: "Hey AIRA, I need to relax, start breathing"
      },
      {
        command: "Stop breathing",
        description: "Stop the current breathing exercise",
        keywords: ["stop breathing", "end breathing", "finish breathing"],
        patterns: ["Stop breathing", "End breathing", "I'm done breathing", "Finish meditation"],
        example: "Hey AIRA, stop breathing"
      }
    ]
  },
  {
    category: "Voice Assistant",
    icon: <Volume2 className="w-5 h-5" />,
    color: "from-orange-500 to-red-500",
    commands: [
      {
        command: "Show commands",
        description: "Show available voice commands",
        keywords: ["commands", "help", "what can you do", "voice commands"],
        patterns: ["Show commands", "What can you do?", "Help", "How do I use voice?"],
        example: "Hey AIRA, what can you do?"
      },
      {
        command: "Stop listening",
        description: "Stop voice recognition",
        keywords: ["stop listening", "stop", "quiet", "shut up"],
        patterns: ["Stop listening", "Stop", "Quiet", "Shut up"],
        example: "Hey AIRA, stop listening"
      }
    ]
  }
];

export function VoiceCommandsHelp() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const toggleCategory = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Command className="w-5 h-5" />
          Voice Commands Guide
          <Badge variant="secondary" className="ml-auto">
            {voiceCommands.reduce((total, cat) => total + cat.commands.length, 0)} Commands
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Tips */}
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Mic className="w-4 h-4" />
            Natural Conversation Tips
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Speak naturally - "I'm feeling happy" works just like "log mood happy"</li>
            <li>• Use conversational phrases - "Take me to tasks" or "Show my dashboard"</li>
            <li>• Express emotions naturally - "I'm stressed" or "I feel great today"</li>
            <li>• Combine commands - "Go to tasks and add buy milk"</li>
            <li>• Say "stop listening" to turn off voice recognition</li>
          </ul>
        </div>

        {/* Command Categories */}
        <div className="space-y-3">
          {voiceCommands.map((category) => (
            <div key={category.category} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCategory(category.category)}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 bg-gradient-to-r ${category.color} rounded-full flex items-center justify-center text-white`}>
                    {category.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium">{category.category}</h3>
                    <p className="text-sm text-muted-foreground">
                      {category.commands.length} commands available
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  {selectedCategory === category.category ? "Hide" : "Show"}
                </Badge>
              </button>
              
              {selectedCategory === category.category && (
                <div className="border-t bg-muted/30">
                  <div className="p-4 space-y-3">
                    {category.commands.map((cmd, index) => (
                      <div key={index} className="p-3 bg-background rounded-lg border">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{cmd.command}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {cmd.description}
                            </p>
                            <div className="mt-2">
                              <p className="text-xs font-medium text-primary">Example:</p>
                              <p className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded mt-1">
                                {cmd.example}
                              </p>
                            </div>
                            <div className="mt-2">
                              <p className="text-xs font-medium text-primary">Natural Patterns:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {cmd.patterns.map((pattern, idx) => (
                                  <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                    {pattern}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground">
                            Keywords: {cmd.keywords.join(", ")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Getting Started */}
        <div className="p-4 bg-success/5 rounded-lg border border-success/20">
          <h4 className="font-medium mb-2 text-success-foreground">Getting Started with Natural Speech</h4>
          <ol className="text-sm text-muted-foreground space-y-1">
            <li>1. Click "Start Listening" in the Voice Assistant</li>
            <li>2. Try natural greetings: "Hello AIRA" or "How are you?"</li>
            <li>3. Express emotions: "I'm feeling happy" or "I'm a bit stressed"</li>
            <li>4. Navigate naturally: "Take me to tasks" or "Show my dashboard"</li>
            <li>5. Add tasks conversationally: "I need to buy groceries"</li>
          </ol>
        </div>

        {/* Advanced Usage */}
        <div className="p-4 bg-blue-5 rounded-lg border border-blue-20">
          <h4 className="font-medium mb-2 text-blue-foreground">Advanced Natural Language</h4>
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Emotional Context:</strong> AIRA understands emotional context in your speech. Saying "I'm overwhelmed with work" will log your mood as stressed.</p>
            <p><strong>Conversational Flow:</strong> You can have natural conversations. Try: "I'm feeling great today, can you show me my tasks?"</p>
            <p><strong>Flexible Commands:</strong> "I need to relax" will start a breathing exercise, "I'm done" will stop it.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 