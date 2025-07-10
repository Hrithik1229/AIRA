import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { BarChart3, CheckSquare, ChevronDown, Heart, History, Home, List, LogOut, Moon, Settings as SettingsIcon, Smile, Sparkles, Sun, Target } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

const navigationItems = [
  { to: "/", icon: Home, label: "Dashboard", end: true },
  { to: "/tasks", icon: List, label: "Tasks" },
  { to: "/goals", icon: Target, label: "Goals" },
  { to: "/mood", icon: Smile, label: "Mood" },
  { to: "/wellness", icon: Heart, label: "Wellness" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/history", icon: History, label: "History" },
  { to: "/settings", icon: SettingsIcon, label: "Settings" },
];

export function Sidebar({ collapsed, onToggle, onLogout }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/",
      description: "Your daily overview"
    },
    {
      title: "Tasks",
      icon: CheckSquare,
      href: "/tasks",
      description: "Manage your tasks"
    },
    {
      title: "Mood",
      icon: Heart,
      href: "/mood",
      description: "Track your emotions"
    },
    {
      title: "Wellness",
      icon: Sparkles,
      href: "/wellness",
      description: "Mindfulness & health"
    },
    {
      title: "Goals",
      icon: Target,
      href: "/goals",
      description: "Set & track goals"
    },
    {
      title: "Analytics",
      icon: BarChart3,
      href: "/analytics",
      description: "View insights"
    },
    {
      title: "History",
      icon: History,
      href: "/history",
      description: "Past activities"
    },
    {
      title: "Settings",
      icon: SettingsIcon,
      href: "/settings",
      description: "App preferences"
    }
  ];

  return (
    <div className="flex h-full">
      <div className={cn(
        "flex flex-col bg-card border-r border-border shadow-lg transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}>
        {/* Enhanced Header */}
        <div className={cn("border-b border-border", collapsed ? "p-2" : "p-6")}>
          <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3 mb-6")}>
            {collapsed ? (
              <Logo size="sm" variant="minimal" />
            ) : (
              <Logo size="md" variant="default" />
            )}
          </div>
          
          {/* User Profile Section */}
          {!collapsed && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors cursor-pointer">
              <Avatar className="w-10 h-10 border-2 border-primary/20">
                <AvatarImage src="/orbit-avatar.png" alt="AIRA" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white">
                  U
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Welcome back!</p>
                <p className="text-xs text-muted-foreground truncate">Ready to flow?</p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className={cn("flex-1 space-y-2", collapsed ? "p-2" : "p-4")}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <TooltipProvider key={item.href}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => navigate(item.href)}
                      className={cn(
                        "w-full flex items-center rounded-xl text-left transition-all duration-200 group relative overflow-hidden",
                        collapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3",
                        isActive 
                          ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary border border-primary/20 shadow-sm" 
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-purple-600 rounded-r-full"></div>
                      )}
                      
                      {/* Icon with enhanced styling */}
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
                        isActive 
                          ? "bg-primary text-primary-foreground shadow-md" 
                          : "bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary"
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      
                      {/* Text content */}
                      {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "font-medium transition-colors",
                            isActive ? "text-primary" : "group-hover:text-foreground"
                          )}>
                            {item.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </p>
                        </div>
                      )}
                      
                      {/* Hover effect */}
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 transition-opacity duration-200",
                        "group-hover:opacity-100"
                      )} />
                    </button>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right" className="tooltip-content">
                      <p>{item.description}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </nav>

        {/* Enhanced Footer */}
        <div className={cn("border-t border-border space-y-4", collapsed ? "p-2" : "p-4")}>
          {/* Theme Toggle */}
          <div className={cn("flex items-center rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors", collapsed ? "justify-center p-2" : "justify-between p-3")}>
            <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-yellow-500" />
                ) : (
                  <Sun className="w-4 h-4 text-orange-500" />
                )}
              </div>
              {!collapsed && (
                <div>
                  <p className="text-sm font-medium">Theme</p>
                  <p className="text-xs text-muted-foreground capitalize">{theme}</p>
                </div>
              )}
            </div>
            {!collapsed && (
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="data-[state=checked]:bg-primary"
              />
            )}
          </div>

          {/* Quick Actions */}
          {!collapsed && (
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 text-xs"
                onClick={() => navigate('/mood')}
              >
                <Heart className="w-3 h-3 mr-1" />
                Mood
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 text-xs"
                onClick={() => navigate('/wellness')}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Wellness
              </Button>
            </div>
          )}

          {/* Logout Button */}
          <div className={cn("flex items-center rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors", collapsed ? "justify-center p-2" : "justify-between p-3")}>
            <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                <LogOut className="w-4 h-4 text-red-500" />
              </div>
              {!collapsed && (
                <div>
                  <p className="text-sm font-medium">Account</p>
                  <p className="text-xs text-muted-foreground">Sign out</p>
                </div>
              )}
            </div>
            {!collapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              >
                Logout
              </Button>
            )}
          </div>

          {/* App Version */}
          {!collapsed && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                AIRA v1.0.0
              </p>
              <p className="text-xs text-muted-foreground">
                Made with ❤️ for your mind
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}