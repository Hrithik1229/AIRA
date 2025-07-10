import {
    Heart,
    List,
    MessageSquare,
    Plus,
    Sparkles,
    Target,
    X
} from "lucide-react";
import { useState } from "react";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card, CardContent } from "./card";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  action: () => void;
}

interface QuickActionsProps {
  onNavigate: (path: string) => void;
  onQuickMood?: () => void;
  onQuickTask?: () => void;
}

export function QuickActions({ onNavigate, onQuickMood, onQuickTask }: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions: QuickAction[] = [
    {
      id: "mood",
      label: "Quick Mood",
      icon: Heart,
      color: "bg-red-500 hover:bg-red-600",
      action: () => {
        onQuickMood?.();
        setIsOpen(false);
      }
    },
    {
      id: "chat",
      label: "Chat with AIRA",
      icon: MessageSquare,
      color: "bg-blue-500 hover:bg-blue-600",
      action: () => {
        onNavigate("/mood");
        setIsOpen(false);
      }
    },
    {
      id: "task",
      label: "Quick Task",
      icon: List,
      color: "bg-green-500 hover:bg-green-600",
      action: () => {
        onQuickTask?.();
        setIsOpen(false);
      }
    },
    {
      id: "goals",
      label: "Set Goals",
      icon: Target,
      color: "bg-purple-500 hover:bg-purple-600",
      action: () => {
        onNavigate("/goals");
        setIsOpen(false);
      }
    },
    {
      id: "wellness",
      label: "Wellness",
      icon: Sparkles,
      color: "bg-orange-500 hover:bg-orange-600",
      action: () => {
        onNavigate("/wellness");
        setIsOpen(false);
      }
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Quick Actions Menu */}
      {isOpen && (
        <Card className="mb-4 shadow-xl border-0 bg-background/95 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="space-y-2">
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.id}
                    variant="ghost"
                    size="sm"
                    onClick={action.action}
                    className="w-full justify-start gap-3 hover:bg-muted/50"
                  >
                    <div className={`w-8 h-8 rounded-full ${action.color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Floating Action Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="lg"
        className={`
          w-14 h-14 rounded-full shadow-lg transition-all duration-300
          ${isOpen 
            ? 'bg-destructive hover:bg-destructive/90' 
            : 'bg-primary hover:bg-primary/90'
          }
        `}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Plus className="w-6 h-6" />
        )}
      </Button>

      {/* Keyboard Shortcut Hint */}
      {!isOpen && (
        <div className="absolute -top-8 right-0">
          <Badge variant="secondary" className="text-xs">
            Ctrl + K
          </Badge>
        </div>
      )}
    </div>
  );
} 