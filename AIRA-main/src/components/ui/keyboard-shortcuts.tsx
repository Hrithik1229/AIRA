import { Command, Heart, List, Settings, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "./badge";
import { Card, CardContent } from "./card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";

interface Shortcut {
  key: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: () => void;
}

interface KeyboardShortcutsProps {
  onNavigate: (path: string) => void;
}

export function KeyboardShortcuts({ onNavigate }: KeyboardShortcutsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts: Shortcut[] = [
    {
      key: "Ctrl + K",
      description: "Open keyboard shortcuts",
      icon: Command,
      action: () => setIsOpen(true)
    },
    {
      key: "Ctrl + H",
      description: "Go to Dashboard",
      icon: Heart,
      action: () => onNavigate("/")
    },
    {
      key: "Ctrl + T",
      description: "Go to Tasks",
      icon: List,
      action: () => onNavigate("/tasks")
    },
    {
      key: "Ctrl + G",
      description: "Go to Goals",
      icon: Target,
      action: () => onNavigate("/goals")
    },
    {
      key: "Ctrl + ,",
      description: "Open Settings",
      icon: Settings,
      action: () => onNavigate("/settings")
    }
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + K to open shortcuts
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      
      // Other shortcuts
      if (e.ctrlKey) {
        switch (e.key) {
          case 'h':
            e.preventDefault();
            onNavigate("/");
            break;
          case 't':
            e.preventDefault();
            onNavigate("/tasks");
            break;
          case 'g':
            e.preventDefault();
            onNavigate("/goals");
            break;
          case ',':
            e.preventDefault();
            onNavigate("/settings");
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Command className="w-5 h-5" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shortcuts.map((shortcut) => {
              const Icon = shortcut.icon;
              return (
                <Card key={shortcut.key} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{shortcut.description}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {shortcut.key}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              💡 Tip: You can also press <kbd className="px-1 py-0.5 bg-background border rounded text-xs">Ctrl + K</kbd> anytime to see this menu
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 