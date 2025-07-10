import orbitAvatar from "@/assets/orbit-avatar.png";
import { MoodChatbot } from "@/components/ai/MoodChatbot";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BreathingTimer } from "@/components/wellness/BreathingTimer";
import { type MoodAnalysis } from "@/services/ai-service";
import { BarChart, Calendar, Heart, Sparkles, TrendingUp, Wind } from "lucide-react";
import { useEffect, useState } from "react";

// Mood-specific affirmations
const moodAffirmations = {
  Happy: [
    "Your positive energy is contagious! Keep spreading joy ✨",
    "This happiness is well-deserved. Savor every moment 🌟",
    "Your good mood is a testament to your resilience and growth 🌈",
    "Share this positive energy with others - it multiplies when shared 💫",
    "You're creating beautiful moments that will become cherished memories 🌸"
  ],
  Sad: [
    "It's okay to feel sad. Your emotions are valid and temporary 💙",
    "You don't have to be strong all the time. It's okay to rest 🌧️",
    "This feeling won't last forever. Brighter days are ahead 🌅",
    "You're not alone in this. Many people care about you 🤗",
    "Be gentle with yourself today. You're doing the best you can 🌱"
  ],
  Stressed: [
    "You're stronger than this stress. Take it one breath at a time 🧘‍♀️",
    "This overwhelming feeling is temporary. You will get through this 💪",
    "It's okay to ask for help. You don't have to carry everything alone 🤝",
    "Small steps forward are still progress. Be patient with yourself 🐌",
    "Your worth isn't measured by your productivity. Rest is productive 😌"
  ],
  Anxious: [
    "You are safe in this moment. Focus on your breath 🫁",
    "Anxiety doesn't define you. It's a feeling, not who you are 🌸",
    "You've survived 100% of your anxious moments. You're resilient 💪",
    "This feeling will pass. You are stronger than your anxiety 🌅",
    "Take it one moment at a time. You don't have to figure everything out now 🕰️"
  ],
  Depressed: [
    "Depression lies. You are worthy of love and care 💜",
    "Getting out of bed today is a victory. Celebrate small wins 🏆",
    "You don't have to face this alone. Help is available and effective 🤝",
    "Your feelings are valid, but they don't define your future 🌅",
    "Recovery is possible. You deserve to feel better 💙"
  ],
  Lonely: [
    "You are worthy of connection and belonging 💝",
    "Loneliness is a common human experience. You're not alone in feeling alone 🤗",
    "Connection is possible, even if it feels difficult right now 🌟",
    "Your presence matters. The world is better with you in it 🌍",
    "Reach out when you're ready. People want to connect with you 📞"
  ],
  Angry: [
    "Your anger is valid. It's okay to feel this way 🔥",
    "Express your feelings safely. You deserve to be heard 📢",
    "Anger often protects something important. What are you protecting? 🛡️",
    "You can be angry and still be a good person 💪",
    "Find healthy ways to release this energy. You have choices 🌊"
  ],
  Calm: [
    "This peaceful state is beautiful. Enjoy this moment of tranquility 🧘‍♀️",
    "Your calm energy is healing for yourself and others 🌸",
    "Use this centered state to make decisions from a place of clarity 🎯",
    "This peace is a sign of your inner strength and wisdom ✨",
    "Share this calm energy with the world. It's needed 🌍"
  ],
  Grieving: [
    "Grief is love with nowhere to go. Your feelings honor your loss 💔",
    "There's no timeline for grief. Be patient with yourself 🕰️",
    "Your memories are precious. Hold them close to your heart 💝",
    "It's okay to feel a mix of emotions. Grief is complex 🌈",
    "You don't have to 'get over it.' You learn to live with it 🌱"
  ],
  Traumatized: [
    "You are not defined by what happened to you. You are so much more 🌟",
    "Healing takes time. Be patient with your recovery journey 🦋",
    "Your trauma responses are normal reactions to abnormal events 🛡️",
    "You deserve to heal and find peace. Professional help can guide you 💜",
    "You are stronger than you know. Your survival is proof of your strength 💪"
  ],
  Crisis: [
    "You are not alone. Help is available and effective 🆘",
    "Your life has value and meaning. You matter 💝",
    "These feelings are temporary, even if they don't feel that way 🌅",
    "Reach out for help. You deserve support and care 🤝",
    "You are worthy of help and healing. Don't give up on yourself 💙"
  ],
  Mixed: [
    "Complex emotions are normal. You don't have to figure everything out now 🤔",
    "It's okay to feel multiple things at once. You're human 🌈",
    "Give yourself permission to feel what you feel 💝",
    "You're doing the best you can with what you have 💪",
    "This too shall pass. Brighter moments are ahead 🌅"
  ],
  default: [
    "You are capable of amazing things! ✨",
    "Every small step forward is progress worth celebrating 🌟",
    "Your feelings are valid, and it's okay to have difficult days 💙",
    "You have overcome challenges before, and you will again 🌈",
    "Take a moment to breathe. You're doing better than you think 🧘‍♀️",
    "Your unique perspective makes the world a better place 🌍",
  ]
};



// Mood history interface
interface MoodEntry {
  id: string;
  mood: string;
  confidence: number;
  timestamp: Date;
  emoji: string;
}

export default function Mood() {
  const [currentAffirmation, setCurrentAffirmation] = useState(0);
  const [showBreathing, setShowBreathing] = useState(false);
  const [currentMood, setCurrentMood] = useState<MoodAnalysis | null>(null);

  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);

  // Load mood history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('moodHistory');
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory);
      // Convert timestamp strings back to Date objects
      const historyWithDates = parsed.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));
      setMoodHistory(historyWithDates);
    }
  }, []);

  // Save mood history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('moodHistory', JSON.stringify(moodHistory));
  }, [moodHistory]);

  // Add new mood entry when currentMood changes
  useEffect(() => {
    if (currentMood) {
      const newEntry: MoodEntry = {
        id: Date.now().toString(),
        mood: currentMood.primaryMood,
        confidence: currentMood.confidence,
        timestamp: new Date(),
        emoji: currentMood.emoji
      };
      setMoodHistory(prev => [newEntry, ...prev.slice(0, 29)]); // Keep last 30 entries
    }
  }, [currentMood]);

  // Get recent mood entries (last 7 days)
  const getRecentMoods = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return moodHistory.filter(entry => entry.timestamp >= sevenDaysAgo);
  };

  // Get mood frequency for the last 7 days
  const getMoodFrequency = () => {
    const recentMoods = getRecentMoods();
    const frequency: { [key: string]: number } = {};
    recentMoods.forEach(entry => {
      frequency[entry.mood] = (frequency[entry.mood] || 0) + 1;
    });
    return frequency;
  };

  // Get most common mood
  const getMostCommonMood = () => {
    const frequency = getMoodFrequency();
    const entries = Object.entries(frequency);
    if (entries.length === 0) return null;
    return entries.reduce((a, b) => frequency[a[0]] > frequency[b[0]] ? a : b)[0];
  };

  // Format date for display
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const getNewAffirmation = () => {
    const moodType = currentMood?.primaryMood || 'default';
    const affirmations = moodAffirmations[moodType as keyof typeof moodAffirmations] || moodAffirmations.default;
    const newIndex = (currentAffirmation + 1) % affirmations.length;
    setCurrentAffirmation(newIndex);
  };

  const getCurrentAffirmation = () => {
    const moodType = currentMood?.primaryMood || 'default';
    const affirmations = moodAffirmations[moodType as keyof typeof moodAffirmations] || moodAffirmations.default;
    return affirmations[currentAffirmation];
  };

  const getMoodBasedStyling = () => {
    if (!currentMood) {
      return "from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20";
    }

    const moodColors = {
      Happy: "from-yellow-100 via-orange-50 to-amber-100 dark:from-yellow-900/40 dark:via-orange-900/20 dark:to-amber-900/40",
      Sad: "from-blue-100 via-indigo-50 to-purple-100 dark:from-blue-900/40 dark:via-indigo-900/20 dark:to-purple-900/40",
      Stressed: "from-orange-100 via-red-50 to-pink-100 dark:from-orange-900/40 dark:via-red-900/20 dark:to-pink-900/40",
      Anxious: "from-yellow-100 via-amber-50 to-orange-100 dark:from-yellow-900/40 dark:via-amber-900/20 dark:to-orange-900/40",
      Depressed: "from-gray-100 via-slate-50 to-blue-100 dark:from-gray-800/40 dark:via-slate-800/20 dark:to-blue-900/40",
      Lonely: "from-purple-100 via-violet-50 to-blue-100 dark:from-purple-900/40 dark:via-violet-900/20 dark:to-blue-900/40",
      Angry: "from-red-100 via-orange-50 to-yellow-100 dark:from-red-900/40 dark:via-orange-900/20 dark:to-yellow-900/40",
      Calm: "from-green-100 via-emerald-50 to-teal-100 dark:from-green-900/40 dark:via-emerald-900/20 dark:to-teal-900/40",
      Grieving: "from-purple-100 via-pink-50 to-rose-100 dark:from-purple-900/40 dark:via-pink-900/20 dark:to-rose-900/40",
      Traumatized: "from-gray-100 via-slate-50 to-purple-100 dark:from-gray-800/40 dark:via-slate-800/20 dark:to-purple-900/40",
      Crisis: "from-red-100 via-pink-50 to-rose-100 dark:from-red-900/40 dark:via-pink-900/20 dark:to-rose-900/40",
      Mixed: "from-gray-100 via-blue-50 to-indigo-100 dark:from-gray-800/40 dark:via-blue-900/20 dark:to-indigo-900/40"
    };

    return moodColors[currentMood.primaryMood as keyof typeof moodColors] || "from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20";
  };

  const getMoodBasedCardBackground = () => {
    if (!currentMood) {
      return "bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900/50 dark:to-blue-900/20";
    }

    const moodCardBackgrounds = {
      Happy: "bg-gradient-to-br from-yellow-50 via-orange-25 to-amber-50 dark:from-yellow-900/30 dark:via-orange-900/15 dark:to-amber-900/30",
      Sad: "bg-gradient-to-br from-blue-50 via-indigo-25 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/15 dark:to-purple-900/30",
      Stressed: "bg-gradient-to-br from-orange-50 via-red-25 to-pink-50 dark:from-orange-900/30 dark:via-red-900/15 dark:to-pink-900/30",
      Anxious: "bg-gradient-to-br from-yellow-50 via-amber-25 to-orange-50 dark:from-yellow-900/30 dark:via-amber-900/15 dark:to-orange-900/30",
      Depressed: "bg-gradient-to-br from-gray-50 via-slate-25 to-blue-50 dark:from-gray-800/30 dark:via-slate-800/15 dark:to-blue-900/30",
      Lonely: "bg-gradient-to-br from-purple-50 via-violet-25 to-blue-50 dark:from-purple-900/30 dark:via-violet-900/15 dark:to-blue-900/30",
      Angry: "bg-gradient-to-br from-red-50 via-orange-25 to-yellow-50 dark:from-red-900/30 dark:via-orange-900/15 dark:to-yellow-900/30",
      Calm: "bg-gradient-to-br from-green-50 via-emerald-25 to-teal-50 dark:from-green-900/30 dark:via-emerald-900/15 dark:to-teal-900/30",
      Grieving: "bg-gradient-to-br from-purple-50 via-pink-25 to-rose-50 dark:from-purple-900/30 dark:via-pink-900/15 dark:to-rose-900/30",
      Traumatized: "bg-gradient-to-br from-gray-50 via-slate-25 to-purple-50 dark:from-gray-800/30 dark:via-slate-800/15 dark:to-purple-900/30",
      Crisis: "bg-gradient-to-br from-red-50 via-pink-25 to-rose-50 dark:from-red-900/30 dark:via-pink-900/15 dark:to-rose-900/30",
      Mixed: "bg-gradient-to-br from-gray-50 via-blue-25 to-indigo-50 dark:from-gray-800/30 dark:via-blue-900/15 dark:to-indigo-900/30"
    };

    return moodCardBackgrounds[currentMood.primaryMood as keyof typeof moodCardBackgrounds] || "bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900/50 dark:to-blue-900/20";
  };

  const getMoodEmoji = () => {
    if (!currentMood) return "💫";
    return currentMood.emoji;
  };

  const getMoodTitle = () => {
    if (!currentMood) return "Daily Affirmation 💫";
    return `Affirmation for ${currentMood.primaryMood} ${getMoodEmoji()}`;
  };

  // Breathing exercise logic


  return (
    <div className="space-y-8 md:space-y-16 max-w-5xl mx-auto px-4 py-4 md:py-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
        <img 
          src={orbitAvatar} 
          alt="AIRA" 
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full shadow-lg"
        />
        <div className="text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Mental Wellness
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mt-2 sm:mt-3">
            Your emotional wellbeing matters. Let's check in with yourself 🤗
          </p>
        </div>
      </div>

      {/* Mood Check-in */}
      <Card className="border-none shadow-xl bg-gradient-to-br from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10">
        <CardHeader className="pb-6">
          <CardTitle className="text-xl sm:text-2xl text-foreground flex items-center gap-3">
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            How are you feeling right now?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MoodChatbot onMoodChange={setCurrentMood} />
        </CardContent>
      </Card>

      {/* Daily Affirmation */}
      <Card className={`border-none shadow-xl ${getMoodBasedCardBackground()}`}>
        <CardHeader className="pb-6">
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-lg sm:text-xl gap-3">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              {getMoodTitle()}
            </span>
            <Button onClick={getNewAffirmation} variant="outline" size="sm" className="hover:scale-105 transition-transform w-full sm:w-auto">
              New One
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-center p-6 sm:p-10 bg-gradient-to-r ${getMoodBasedStyling()} rounded-xl border border-border/50 relative overflow-hidden`}>
            {/* Mood-specific decorative elements */}
            {currentMood && (
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 text-6xl">{currentMood.emoji}</div>
                <div className="absolute bottom-4 left-4 text-4xl">{currentMood.emoji}</div>
                <div className="absolute top-1/2 left-1/4 text-3xl transform -translate-y-1/2">{currentMood.emoji}</div>
                <div className="absolute top-1/3 right-1/4 text-2xl">{currentMood.emoji}</div>
              </div>
            )}
            
            {/* Main content */}
            <div className="relative z-10">
              <p className="text-lg sm:text-xl font-medium text-foreground leading-relaxed">
                {getCurrentAffirmation()}
              </p>
              {currentMood && (
                <div className="mt-6 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2 bg-background/80 dark:bg-background/20 px-4 py-2 rounded-full border border-border/50 shadow-sm">
                    <span>Mood detected: {currentMood.primaryMood}</span>
                    <span className="text-xs">({Math.round(currentMood.confidence * 100)}% confidence)</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breathing Exercise */}
      <Card className="border-none shadow-xl bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900/50 dark:to-blue-900/20">
        <CardHeader className="pb-6">
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-lg sm:text-xl gap-3">
            <span className="flex items-center gap-2">
              <Wind className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
              Mindful Breathing Exercise 🧘‍♀️
            </span>
            <Button 
              onClick={() => setShowBreathing(!showBreathing)} 
              variant="outline" 
              size="sm"
              className="hover:scale-105 transition-transform w-full sm:w-auto"
            >
              {showBreathing ? 'Hide' : 'Show'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!showBreathing ? (
            <div className="text-center py-8 sm:py-16">
              <div className="text-5xl sm:text-7xl mb-6 sm:mb-8 animate-pulse">🫁</div>
              <p className="text-base sm:text-xl text-muted-foreground">
                Take a moment to center yourself with guided breathing exercises
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <BreathingTimer />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mood History */}
      <Card className="border-none shadow-xl bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900/50 dark:to-purple-900/20">
        <CardHeader className="pb-6">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <BarChart className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
            Recent Mood Patterns 📊
          </CardTitle>
        </CardHeader>
        <CardContent>
          {moodHistory.length === 0 ? (
            <div className="text-center py-8 sm:py-16">
              <div className="text-4xl sm:text-6xl mb-6 sm:mb-8 animate-bounce">📈</div>
              <p className="text-base sm:text-xl text-muted-foreground mb-4 sm:mb-6">
                Mood tracking history will appear here as you use the app
              </p>
              <p className="text-sm sm:text-base text-muted-foreground bg-background/80 dark:bg-background/20 px-4 sm:px-6 py-2 sm:py-3 rounded-full inline-block border border-border/50">
                Regular check-ins help identify patterns and celebrate progress!
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-background/80 dark:bg-background/20 rounded-xl p-4 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-muted-foreground">Total Check-ins</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">{moodHistory.length}</div>
                </div>
                
                <div className="bg-background/80 dark:bg-background/20 rounded-xl p-4 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-muted-foreground">This Week</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{getRecentMoods().length}</div>
                </div>
                
                <div className="bg-background/80 dark:bg-background/20 rounded-xl p-4 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-muted-foreground">Most Common</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {getMostCommonMood() || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Mood Frequency Chart */}
              {getRecentMoods().length > 0 && (
                <div className="bg-background/80 dark:bg-background/20 rounded-xl p-6 border border-border/50">
                  <h4 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                    <BarChart className="w-5 h-5 text-primary" />
                    Mood Frequency (Last 7 Days)
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(getMoodFrequency()).map(([mood, count]) => (
                      <div key={mood} className="flex items-center gap-3">
                        <div className="w-20 text-sm font-medium text-muted-foreground">{mood}</div>
                        <div className="flex-1 bg-muted/50 dark:bg-muted/30 rounded-full h-3 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-purple-600 rounded-full transition-all duration-500"
                            style={{ width: `${(count / Math.max(...Object.values(getMoodFrequency()))) * 100}%` }}
                          ></div>
                        </div>
                        <div className="w-8 text-sm font-semibold text-primary">{count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Mood Entries */}
              <div className="bg-background/80 dark:bg-background/20 rounded-xl p-6 border border-border/50">
                <h4 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                  Recent Mood Entries
                </h4>
                <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-primary/5 hover:scrollbar-thumb-primary/50 scrollbar-thumb-rounded-full transition-all duration-300">
                  {moodHistory.slice(0, 10).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-background/50 dark:bg-background/10 rounded-lg border border-border/30">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{entry.emoji}</span>
                        <div>
                          <div className="font-medium text-foreground">{entry.mood}</div>
                          <div className="text-xs text-muted-foreground">{formatDate(entry.timestamp)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-primary">{Math.round(entry.confidence * 100)}%</div>
                        <div className="text-xs text-muted-foreground">confidence</div>
                      </div>
                    </div>
                  ))}
                </div>
                {moodHistory.length > 10 && (
                  <div className="mt-4 text-center">
                    <span className="text-xs text-muted-foreground bg-background/50 dark:bg-background/10 px-3 py-2 rounded-full border border-border/30">
                      Showing 10 of {moodHistory.length} entries
                    </span>
                  </div>
                )}
              </div>

              {/* Insights */}
              {getRecentMoods().length >= 3 && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl p-6 border border-border/50">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-lg">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Mood Insights
                  </h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• You've checked in {getRecentMoods().length} times this week</p>
                    <p>• Your most frequent mood is <span className="font-medium text-primary">{getMostCommonMood()}</span></p>
                    <p>• Keep up the great work tracking your emotional well-being! 🌟</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}