import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

const moods = [
  { emoji: "😊", label: "Happy", value: "happy", color: "mood-happy" },
  { emoji: "😌", label: "Calm", value: "calm", color: "mood-calm" },
  { emoji: "😰", label: "Stressed", value: "stressed", color: "mood-stressed" },
  { emoji: "😔", label: "Sad", value: "sad", color: "mood-sad" },
];

export function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showResponse, setShowResponse] = useState(false);

  const handleMoodSelect = (moodValue: string) => {
    setSelectedMood(moodValue);
    setShowResponse(true);
    
    // Auto-hide response after 3 seconds
    setTimeout(() => setShowResponse(false), 3000);
  };

  const getMoodResponse = (mood: string) => {
    const responses = {
      happy: "That's wonderful! Keep spreading those positive vibes! ✨",
      calm: "Perfect! A peaceful mind is a productive mind. 🧘‍♀️",
      stressed: "I understand. Let's take this one step at a time. 💙",
      sad: "I'm here for you. Remember, it's okay to feel this way. 🤗",
    };
    return responses[mood as keyof typeof responses];
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {moods.map((mood, idx) => (
          <Button
            key={mood.value}
            variant="ghost"
            size="sm"
            onClick={() => handleMoodSelect(mood.value)}
            className={cn(
              "h-auto p-3 flex flex-col items-center gap-1 hover:scale-105 transition-all",
              selectedMood === mood.value && `bg-${mood.color}/20 border border-${mood.color}/30`
            )}
            aria-label={`Select mood: ${mood.label}`}
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === "Enter" || e.key === " ") {
                handleMoodSelect(mood.value);
              }
              // Arrow key navigation
              if (e.key === "ArrowRight" && idx < moods.length - 1) {
                (document.querySelectorAll('[aria-label^="Select mood"]')[idx + 1] as HTMLElement)?.focus();
              }
              if (e.key === "ArrowLeft" && idx > 0) {
                (document.querySelectorAll('[aria-label^="Select mood"]')[idx - 1] as HTMLElement)?.focus();
              }
            }}
          >
            <span className="text-2xl">{mood.emoji}</span>
            <span className="text-xs font-medium">{mood.label}</span>
          </Button>
        ))}
      </div>
      
      {showResponse && selectedMood && (
        <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 animate-fade-in">
          <p className="text-sm text-primary font-medium">
            {getMoodResponse(selectedMood)}
          </p>
        </div>
      )}
    </div>
  );
}