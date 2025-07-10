import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    Award,
    BookOpen,
    CheckCircle,
    Crown,
    Heart,
    Sparkles,
    Star,
    Target,
    Trophy,
    Wind,
    Zap
} from "lucide-react";
import { useEffect, useState } from "react";

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // days
  points: number;
  icon: React.ReactNode;
  color: string;
  requirements: string[];
  progress: number;
  completed: boolean;
  startDate?: Date;
  endDate?: Date;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  unlocked: boolean;
  unlockedDate?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const dailyChallenges: Challenge[] = [
  {
    id: "daily-breathing",
    title: "Mindful Breathing",
    description: "Complete 5 minutes of guided breathing",
    category: "Mindfulness",
    difficulty: "easy",
    duration: 1,
    points: 10,
    icon: <Wind className="w-5 h-5" />,
    color: "from-blue-500 to-indigo-500",
    requirements: ["Complete breathing session"],
    progress: 0,
    completed: false
  },
  {
    id: "daily-journal",
    title: "Daily Reflection",
    description: "Write 100 words in your mood journal",
    category: "Journaling",
    difficulty: "easy",
    duration: 1,
    points: 15,
    icon: <BookOpen className="w-5 h-5" />,
    color: "from-purple-500 to-violet-500",
    requirements: ["Write journal entry", "100+ words"],
    progress: 0,
    completed: false
  },
  {
    id: "daily-gratitude",
    title: "Gratitude Practice",
    description: "List 3 things you're grateful for",
    category: "Mindfulness",
    difficulty: "easy",
    duration: 1,
    points: 10,
    icon: <Heart className="w-5 h-5" />,
    color: "from-red-500 to-pink-500",
    requirements: ["Express gratitude"],
    progress: 0,
    completed: false
  }
];

const weeklyChallenges: Challenge[] = [
  {
    id: "weekly-streak",
    title: "Consistency Champion",
    description: "Complete daily challenges for 7 days in a row",
    category: "Consistency",
    difficulty: "medium",
    duration: 7,
    points: 50,
    icon: <Zap className="w-5 h-5" />,
    color: "from-orange-500 to-red-500",
    requirements: ["7 consecutive days"],
    progress: 0,
    completed: false
  },
  {
    id: "weekly-breathing",
    title: "Breathing Master",
    description: "Complete 30 minutes of breathing exercises",
    category: "Mindfulness",
    difficulty: "medium",
    duration: 7,
    points: 40,
    icon: <Wind className="w-5 h-5" />,
    color: "from-cyan-500 to-blue-500",
    requirements: ["30 minutes total"],
    progress: 0,
    completed: false
  },
  {
    id: "weekly-journal",
    title: "Reflection Journey",
    description: "Write 5 journal entries this week",
    category: "Journaling",
    difficulty: "medium",
    duration: 7,
    points: 45,
    icon: <BookOpen className="w-5 h-5" />,
    color: "from-indigo-500 to-purple-500",
    requirements: ["5 journal entries"],
    progress: 0,
    completed: false
  }
];

const achievements: Achievement[] = [
  {
    id: "first-breath",
    title: "First Breath",
    description: "Complete your first breathing session",
    icon: <Wind className="w-4 h-4" />,
    color: "from-blue-400 to-blue-600",
    unlocked: false,
    rarity: "common"
  },
  {
    id: "first-journal",
    title: "First Words",
    description: "Write your first journal entry",
    icon: <BookOpen className="w-4 h-4" />,
    color: "from-purple-400 to-purple-600",
    unlocked: false,
    rarity: "common"
  },
  {
    id: "week-streak",
    title: "Week Warrior",
    description: "Complete 7 days of challenges",
    icon: <Zap className="w-4 h-4" />,
    color: "from-orange-400 to-orange-600",
    unlocked: false,
    rarity: "rare"
  },
  {
    id: "breathing-master",
    title: "Breathing Master",
    description: "Complete 10 breathing sessions",
    icon: <Trophy className="w-4 h-4" />,
    color: "from-yellow-400 to-yellow-600",
    unlocked: false,
    rarity: "epic"
  },
  {
    id: "journal-keeper",
    title: "Journal Keeper",
    description: "Write 20 journal entries",
    icon: <Star className="w-4 h-4" />,
    color: "from-pink-400 to-pink-600",
    unlocked: false,
    rarity: "epic"
  },
  {
    id: "wellness-champion",
    title: "Wellness Champion",
    description: "Unlock all basic achievements",
    icon: <Crown className="w-4 h-4" />,
    color: "from-purple-400 to-purple-600",
    unlocked: false,
    rarity: "legendary"
  }
];

export function WellnessChallenges() {
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([]);
  const [userAchievements, setUserAchievements] = useState<Achievement[]>(achievements);
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [showCompleted, setShowCompleted] = useState(false);

  // Load user progress from localStorage
  useEffect(() => {
    const savedChallenges = localStorage.getItem('wellness-challenges');
    const savedAchievements = localStorage.getItem('wellness-achievements');
    const savedPoints = localStorage.getItem('wellness-points');
    const savedStreak = localStorage.getItem('wellness-streak');

    if (savedChallenges) {
      const parsed = JSON.parse(savedChallenges);
      const challengesWithDates = parsed.map((challenge: any) => ({
        ...challenge,
        startDate: challenge.startDate ? new Date(challenge.startDate) : undefined,
        endDate: challenge.endDate ? new Date(challenge.endDate) : undefined
      }));
      setActiveChallenges(challengesWithDates);
    } else {
      // Initialize with daily challenges
      const initialChallenges = dailyChallenges.map(challenge => ({
        ...challenge,
        startDate: new Date()
      }));
      setActiveChallenges(initialChallenges);
    }

    if (savedAchievements) {
      const parsed = JSON.parse(savedAchievements);
      const achievementsWithDates = parsed.map((achievement: any) => ({
        ...achievement,
        unlockedDate: achievement.unlockedDate ? new Date(achievement.unlockedDate) : undefined
      }));
      setUserAchievements(achievementsWithDates);
    }

    if (savedPoints) setTotalPoints(parseInt(savedPoints));
    if (savedStreak) setCurrentStreak(parseInt(savedStreak));
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem('wellness-challenges', JSON.stringify(activeChallenges));
    localStorage.setItem('wellness-achievements', JSON.stringify(userAchievements));
    localStorage.setItem('wellness-points', totalPoints.toString());
    localStorage.setItem('wellness-streak', currentStreak.toString());
  }, [activeChallenges, userAchievements, totalPoints, currentStreak]);

  const startChallenge = (challenge: Challenge) => {
    const newChallenge = {
      ...challenge,
      startDate: new Date(),
      endDate: new Date(Date.now() + challenge.duration * 24 * 60 * 60 * 1000)
    };
    
    setActiveChallenges(prev => [...prev, newChallenge]);
  };

  const updateProgress = (challengeId: string, progress: number) => {
    setActiveChallenges(prev => 
      prev.map(challenge => 
        challenge.id === challengeId 
          ? { ...challenge, progress: Math.min(progress, 100) }
          : challenge
      )
    );

    // Check if challenge is completed
    if (progress >= 100) {
      completeChallenge(challengeId);
    }
  };

  const completeChallenge = (challengeId: string) => {
    const challenge = activeChallenges.find(c => c.id === challengeId);
    if (!challenge) return;

    setActiveChallenges(prev => 
      prev.map(c => 
        c.id === challengeId 
          ? { ...c, completed: true, progress: 100 }
          : c
      )
    );

    setTotalPoints(prev => prev + challenge.points);
    setCurrentStreak(prev => prev + 1);

    // Check for achievements
    checkAchievements();
  };

  const checkAchievements = () => {
    const breathingSessions = parseInt(localStorage.getItem('breathing-sessions') || '0');
    const journalEntries = JSON.parse(localStorage.getItem('mood-journal-entries') || '[]').length;

    const newAchievements = userAchievements.map(achievement => {
      let shouldUnlock = false;

      switch (achievement.id) {
        case 'first-breath':
          shouldUnlock = breathingSessions >= 1;
          break;
        case 'first-journal':
          shouldUnlock = journalEntries >= 1;
          break;
        case 'week-streak':
          shouldUnlock = currentStreak >= 7;
          break;
        case 'breathing-master':
          shouldUnlock = breathingSessions >= 10;
          break;
        case 'journal-keeper':
          shouldUnlock = journalEntries >= 20;
          break;
        case 'wellness-champion':
          shouldUnlock = userAchievements.filter(a => a.id !== 'wellness-champion').every(a => a.unlocked);
          break;
      }

      if (shouldUnlock && !achievement.unlocked) {
        return { ...achievement, unlocked: true, unlockedDate: new Date() };
      }
      return achievement;
    });

    setUserAchievements(newAchievements);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-orange-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const availableChallenges = [...dailyChallenges, ...weeklyChallenges].filter(
    challenge => !activeChallenges.some(ac => ac.id === challenge.id)
  );

  const completedChallenges = activeChallenges.filter(c => c.completed);
  const activeChallengesList = activeChallenges.filter(c => !c.completed);

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">Total Points</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{totalPoints}</div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">Current Streak</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{currentStreak} days</div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium">Active Challenges</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{activeChallengesList.length}</div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Award className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium">Achievements</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {userAchievements.filter(a => a.unlocked).length}/{userAchievements.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Challenges */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Active Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeChallengesList.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-6">🎯</div>
              <h3 className="text-xl font-bold text-primary mb-4">
                No Active Challenges
              </h3>
              <p className="text-muted-foreground mb-6">
                Start a challenge to begin your wellness journey!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeChallengesList.map((challenge) => (
                <Card key={challenge.id} className="border border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-12 h-12 bg-gradient-to-br ${challenge.color} rounded-full flex items-center justify-center text-white`}>
                          {challenge.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{challenge.title}</h3>
                            <Badge className={getDifficultyColor(challenge.difficulty)}>
                              {challenge.difficulty}
                            </Badge>
                            <Badge variant="outline">
                              {challenge.points} pts
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {challenge.description}
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Progress</span>
                              <span>{challenge.progress}%</span>
                            </div>
                            <Progress value={challenge.progress} className="h-2" />
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateProgress(challenge.id, challenge.progress + 25)}
                        disabled={challenge.completed}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Update Progress
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Challenges */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Available Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableChallenges.map((challenge) => (
              <Card key={challenge.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${challenge.color} rounded-full flex items-center justify-center text-white mb-3`}>
                    {challenge.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{challenge.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={getDifficultyColor(challenge.difficulty)}>
                      {challenge.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      {challenge.duration} day{challenge.duration > 1 ? 's' : ''}
                    </Badge>
                    <Badge variant="secondary">
                      {challenge.points} pts
                    </Badge>
                  </div>
                  <Button 
                    onClick={() => startChallenge(challenge)}
                    className="w-full"
                    size="sm"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Start Challenge
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userAchievements.map((achievement) => (
              <Card 
                key={achievement.id} 
                className={`transition-all duration-300 ${
                  achievement.unlocked 
                    ? 'ring-2 ring-primary shadow-lg' 
                    : 'opacity-60'
                }`}
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-16 h-16 bg-gradient-to-br ${getRarityColor(achievement.rarity)} rounded-full flex items-center justify-center text-white mx-auto mb-3 ${
                    !achievement.unlocked ? 'grayscale' : ''
                  }`}>
                    {achievement.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{achievement.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                  <div className="flex items-center justify-center gap-2">
                    <Badge className={getRarityColor(achievement.rarity)}>
                      {achievement.rarity}
                    </Badge>
                    {achievement.unlocked && (
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Unlocked
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 