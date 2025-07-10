import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
    BookOpen,
    Brain,
    Calendar,
    Download,
    Eye,
    EyeOff,
    Heart,
    Lightbulb,
    MessageSquare,
    PenTool,
    Plus,
    Save,
    Search,
    Sparkles,
    Trash2,
    TrendingUp,
    Upload,
    Zap
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: string;
  moodScore: number;
  timestamp: Date;
  tags: string[];
  aiInsights?: string;
  isPrivate: boolean;
  wordCount: number;
}

interface JournalPrompt {
  id: string;
  category: string;
  prompt: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const journalPrompts: JournalPrompt[] = [
  {
    id: "gratitude",
    category: "Gratitude",
    prompt: "What are three things you're grateful for today?",
    description: "Focus on the positive aspects of your day",
    icon: <Heart className="w-4 h-4" />,
    color: "from-red-500 to-pink-500"
  },
  {
    id: "reflection",
    category: "Reflection",
    prompt: "What was the most challenging moment today, and how did you handle it?",
    description: "Reflect on your resilience and growth",
    icon: <Brain className="w-4 h-4" />,
    color: "from-blue-500 to-indigo-500"
  },
  {
    id: "goals",
    category: "Goals",
    prompt: "What's one small step you can take tomorrow toward your goals?",
    description: "Plan actionable steps for your future",
    icon: <TrendingUp className="w-4 h-4" />,
    color: "from-green-500 to-emerald-500"
  },
  {
    id: "emotions",
    category: "Emotions",
    prompt: "Describe your emotional journey today. What triggered different feelings?",
    description: "Explore your emotional landscape",
    icon: <MessageSquare className="w-4 h-4" />,
    color: "from-purple-500 to-violet-500"
  },
  {
    id: "relationships",
    category: "Relationships",
    prompt: "How did you connect with others today? What meaningful interactions did you have?",
    description: "Reflect on your social connections",
    icon: <Heart className="w-4 h-4" />,
    color: "from-orange-500 to-red-500"
  },
  {
    id: "self-care",
    category: "Self-Care",
    prompt: "What did you do today to take care of yourself? How did it make you feel?",
    description: "Celebrate your self-care practices",
    icon: <Sparkles className="w-4 h-4" />,
    color: "from-yellow-500 to-orange-500"
  }
];

export function MoodJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<JournalPrompt | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMood, setFilterMood] = useState("");
  const [showPrivate, setShowPrivate] = useState(true);
  const [activeTab, setActiveTab] = useState("write");
  const [autoSave, setAutoSave] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load entries from localStorage
  useEffect(() => {
    const savedEntries = localStorage.getItem('mood-journal-entries');
    if (savedEntries) {
      const parsed = JSON.parse(savedEntries);
      const entriesWithDates = parsed.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));
      setEntries(entriesWithDates);
    }
  }, []);

  // Save entries to localStorage
  useEffect(() => {
    localStorage.setItem('mood-journal-entries', JSON.stringify(entries));
  }, [entries]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && currentEntry && isEditing) {
      const timeoutId = setTimeout(() => {
        saveEntry();
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [currentEntry, autoSave, isEditing]);

  // Calculate word count
  useEffect(() => {
    if (currentEntry?.content) {
      const words = currentEntry.content.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
    } else {
      setWordCount(0);
    }
  }, [currentEntry?.content]);

  const createNewEntry = (prompt?: JournalPrompt) => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      title: prompt ? `Journal Entry - ${prompt.category}` : "New Journal Entry",
      content: prompt ? `Prompt: ${prompt.prompt}\n\n` : "",
      mood: "Neutral",
      moodScore: 5,
      timestamp: new Date(),
      tags: prompt ? [prompt.category.toLowerCase()] : [],
      isPrivate: false,
      wordCount: 0
    };
    
    setCurrentEntry(newEntry);
    setIsEditing(true);
    setIsViewing(false);
    setSelectedPrompt(prompt || null);
    setActiveTab("write");
  };

  const saveEntry = () => {
    if (!currentEntry) return;
    
    const updatedEntry = {
      ...currentEntry,
      wordCount,
      timestamp: new Date()
    };
    
    setEntries(prev => {
      const existingIndex = prev.findIndex(entry => entry.id === currentEntry.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = updatedEntry;
        return updated;
      } else {
        return [updatedEntry, ...prev];
      }
    });
    
    setCurrentEntry(updatedEntry);
    setIsEditing(false);
    setIsViewing(false);
  };

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
    if (currentEntry?.id === id) {
      setCurrentEntry(null);
      setIsEditing(false);
    }
  };

  const generateAIInsights = async (entry: JournalEntry) => {
    // Simulate AI analysis
    const insights = [
      "Your writing shows a pattern of resilience and growth mindset.",
      "I notice you're focusing on positive aspects, which is great for mental health.",
      "Consider exploring the emotions behind your experiences more deeply.",
      "Your self-reflection demonstrates emotional intelligence and self-awareness."
    ];
    
    const randomInsight = insights[Math.floor(Math.random() * insights.length)];
    
    const updatedEntry = {
      ...entry,
      aiInsights: randomInsight
    };
    
    setEntries(prev => 
      prev.map(e => e.id === entry.id ? updatedEntry : e)
    );
    
    if (currentEntry?.id === entry.id) {
      setCurrentEntry(updatedEntry);
    }
  };

  const exportEntries = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mood-journal-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importEntries = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          setEntries(imported);
        } catch (error) {
          console.error('Error importing entries:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesMood = !filterMood || entry.mood.toLowerCase() === filterMood.toLowerCase();
    const matchesPrivacy = showPrivate || !entry.isPrivate;
    
    return matchesSearch && matchesMood && matchesPrivacy;
  });

  const getMoodColor = (mood: string) => {
    const moodColors: { [key: string]: string } = {
      'Happy': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Sad': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Anxious': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Stressed': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Calm': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Excited': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'Neutral': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return moodColors[mood] || moodColors['Neutral'];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="write" className="flex items-center gap-2">
            <PenTool className="w-4 h-4" />
            Write
          </TabsTrigger>
          <TabsTrigger value="prompts" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Prompts
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Write Tab */}
        <TabsContent value="write" className="space-y-6">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-primary" />
                  {isEditing ? 'Editing Entry' : 'New Journal Entry'}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAutoSave(!autoSave)}
                    className={autoSave ? 'bg-green-50 text-green-700' : ''}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    {autoSave ? 'Auto-save ON' : 'Auto-save OFF'}
                  </Button>
                  {isEditing && (
                    <Button onClick={saveEntry} size="sm">
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
                        {!isEditing && !isViewing ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">📝</div>
              <h3 className="text-2xl font-bold text-primary mb-4">
                Start Your Journal Entry
              </h3>
              <p className="text-muted-foreground mb-8">
                Express your thoughts, feelings, and experiences
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => createNewEntry()} size="lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Start Writing
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab("prompts")}
                  size="lg"
                >
                  <Lightbulb className="w-5 h-5 mr-2" />
                  Get Inspired
                </Button>
              </div>
            </div>
          ) : isViewing ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  placeholder="Entry title..."
                  value={currentEntry?.title || ''}
                  disabled
                  className="flex-1 text-lg font-semibold bg-transparent border-none outline-none text-muted-foreground"
                />
                <div className="flex items-center gap-2">
                  <Badge className={getMoodColor(currentEntry?.mood || 'Neutral')}>
                    {currentEntry?.mood || 'Neutral'}
                  </Badge>
                  {currentEntry?.isPrivate && (
                    <Badge variant="outline">
                      <EyeOff className="w-3 h-3 mr-1" />
                      Private
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="bg-muted/20 rounded-lg p-6 min-h-[300px]">
                <div className="whitespace-pre-wrap text-base leading-relaxed">
                  {currentEntry?.content || ''}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{currentEntry?.wordCount || 0} words</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {currentEntry?.timestamp ? formatDate(currentEntry.timestamp) : ''}
                </span>
              </div>
              
              {currentEntry?.aiInsights && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">AI Insight</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{currentEntry.aiInsights}</p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsViewing(false);
                    setCurrentEntry(null);
                  }}
                  className="flex-1"
                >
                  Back to History
                </Button>
                <Button 
                  onClick={() => {
                    setIsViewing(false);
                    setIsEditing(true);
                  }}
                >
                  <PenTool className="w-4 h-4 mr-2" />
                  Edit Entry
                </Button>
              </div>
            </div>
          ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      placeholder="Entry title..."
                      value={currentEntry?.title || ''}
                      onChange={(e) => setCurrentEntry(prev => prev ? {...prev, title: e.target.value} : null)}
                      className="flex-1 text-lg font-semibold bg-transparent border-none outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <select
                        value={currentEntry?.mood || 'Neutral'}
                        onChange={(e) => setCurrentEntry(prev => prev ? {...prev, mood: e.target.value} : null)}
                        className="px-3 py-1 rounded-md border border-border bg-background"
                      >
                        <option value="Happy">Happy</option>
                        <option value="Sad">Sad</option>
                        <option value="Anxious">Anxious</option>
                        <option value="Stressed">Stressed</option>
                        <option value="Calm">Calm</option>
                        <option value="Excited">Excited</option>
                        <option value="Neutral">Neutral</option>
                      </select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentEntry(prev => prev ? {...prev, isPrivate: !prev.isPrivate} : null)}
                      >
                        {currentEntry?.isPrivate ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  {selectedPrompt && (
                    <div className={`p-4 rounded-lg bg-gradient-to-r ${selectedPrompt.color} text-white`}>
                      <div className="flex items-center gap-2 mb-2">
                        {selectedPrompt.icon}
                        <span className="font-semibold">{selectedPrompt.category}</span>
                      </div>
                      <p className="text-sm opacity-90">{selectedPrompt.prompt}</p>
                    </div>
                  )}
                  
                  <Textarea
                    ref={textareaRef}
                    placeholder="Start writing your thoughts..."
                    value={currentEntry?.content || ''}
                    onChange={(e) => setCurrentEntry(prev => prev ? {...prev, content: e.target.value} : null)}
                    className="min-h-[300px] text-base leading-relaxed resize-none"
                  />
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{wordCount} words</span>
                    <span>{currentEntry?.isPrivate ? 'Private Entry' : 'Public Entry'}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={saveEntry} className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      Save Entry
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        setIsViewing(false);
                        setCurrentEntry(null);
                        setSelectedPrompt(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prompts Tab */}
        <TabsContent value="prompts" className="space-y-6">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                Journal Prompts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {journalPrompts.map((prompt) => (
                  <Card 
                    key={prompt.id}
                    className="cursor-pointer hover:shadow-md transition-all duration-300 hover:scale-105"
                    onClick={() => createNewEntry(prompt)}
                  >
                    <CardContent className="p-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${prompt.color} rounded-full flex items-center justify-center text-white mb-3`}>
                        {prompt.icon}
                      </div>
                      <h3 className="font-semibold mb-2">{prompt.category}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{prompt.description}</p>
                      <p className="text-sm font-medium">{prompt.prompt}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Journal History
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={exportEntries}>
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <label>
                      <Upload className="w-4 h-4 mr-1" />
                      Import
                      <input
                        type="file"
                        accept=".json"
                        onChange={importEntries}
                        className="hidden"
                      />
                    </label>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search entries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background"
                  />
                </div>
                <select
                  value={filterMood}
                  onChange={(e) => setFilterMood(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="">All Moods</option>
                  <option value="Happy">Happy</option>
                  <option value="Sad">Sad</option>
                  <option value="Anxious">Anxious</option>
                  <option value="Stressed">Stressed</option>
                  <option value="Calm">Calm</option>
                  <option value="Excited">Excited</option>
                  <option value="Neutral">Neutral</option>
                </select>
                <Button
                  variant="outline"
                  onClick={() => setShowPrivate(!showPrivate)}
                  className={showPrivate ? 'bg-primary text-primary-foreground' : ''}
                >
                  {showPrivate ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
              </div>

              {/* Entries List */}
              {filteredEntries.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-6">📚</div>
                  <h3 className="text-2xl font-bold text-primary mb-4">
                    No Journal Entries Yet
                  </h3>
                  <p className="text-muted-foreground mb-8">
                    Start writing to see your journal history here
                  </p>
                  <Button onClick={() => setActiveTab("write")}>
                    <Plus className="w-5 h-5 mr-2" />
                    Write Your First Entry
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEntries.map((entry) => (
                    <Card key={entry.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{entry.title}</h3>
                              <Badge className={getMoodColor(entry.mood)}>
                                {entry.mood}
                              </Badge>
                              {entry.isPrivate && (
                                <Badge variant="outline">
                                  <EyeOff className="w-3 h-3 mr-1" />
                                  Private
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {entry.content.substring(0, 150)}...
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(entry.timestamp)}
                              </span>
                              <span className="flex items-center gap-1">
                                <PenTool className="w-3 h-3" />
                                {entry.wordCount} words
                              </span>
                              {entry.tags.length > 0 && (
                                <div className="flex gap-1">
                                  {entry.tags.slice(0, 2).map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCurrentEntry(entry);
                                setIsEditing(false);
                                setIsViewing(true);
                                setActiveTab("write");
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {!entry.aiInsights && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => generateAIInsights(entry)}
                              >
                                <Zap className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteEntry(entry.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {entry.aiInsights && (
                          <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-border/50">
                            <div className="flex items-center gap-2 mb-1">
                              <Brain className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium">AI Insight</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{entry.aiInsights}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 