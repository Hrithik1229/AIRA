import { UserProfile } from "@/components/auth/UserProfile";
import { NotificationTest } from "@/components/notifications/NotificationTest";
import { SmartNotifications } from "@/components/notifications/SmartNotifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { VoiceCommandsHelp } from "@/components/voice/VoiceCommandsHelp";
import { VoiceSettings } from "@/components/voice/VoiceSettings";
import { authService } from "@/services/auth-service";
import { Bot, Palette, Settings as SettingsIcon, Shield, User } from "lucide-react";
import { useEffect, useState } from "react";

export default function Settings() {
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    // Update user when auth state changes
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const handleUserUpdate = (updatedUser: any) => {
    setCurrentUser(updatedUser);
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading user profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <SettingsIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Configure your AIRA experience ⚙️
          </p>
        </div>
      </div>

      {/* User Profile Section */}
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Account & Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UserProfile user={currentUser} onUserUpdate={handleUserUpdate} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Appearance */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-medium">Theme</h3>
                <p className="text-sm text-muted-foreground">
                  Choose between light and dark mode
                </p>
              </div>
              <ThemeToggle />
            </div>
            
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                🌙 Dark mode provides a more comfortable experience in low-light environments
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-medium">Data Storage</h3>
                  <p className="text-sm text-muted-foreground">
                    All data is stored locally on your device
                  </p>
                </div>
                <div className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                  Secure
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-medium">AI Processing</h3>
                  <p className="text-sm text-muted-foreground">
                    Mood analysis uses Google's Gemini AI
                  </p>
                </div>
                <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                  External
                </div>
              </div>
              
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  🔒 Your personal data never leaves your device. AI analysis is done securely through Google's API.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Settings */}
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            AI Assistant Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-medium">AI Chat</h3>
                <p className="text-sm text-muted-foreground">
                  Enable AI-powered mood analysis and support
                </p>
              </div>
              <div className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                Enabled
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-medium">Smart Suggestions</h3>
                <p className="text-sm text-muted-foreground">
                  Get personalized recommendations based on your data
                </p>
              </div>
              <div className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                Enabled
              </div>
            </div>
            
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                🤖 AI features help provide personalized insights and recommendations for your mental wellness journey
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice Assistant Settings */}
      <VoiceSettings />

      {/* Voice Commands Help */}
      <VoiceCommandsHelp />

      {/* About */}
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            About AIRA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">
                AIRA is your AI-powered personal daily life assistant for mental wellness and productivity.
              </p>
              <p className="mb-2">
                Features include:
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>AI-powered mood analysis and support</li>
                <li>Task management and organization</li>
                <li>Goal setting and habit tracking</li>
                <li>Progress tracking and insights</li>
                <li>Personalized recommendations</li>
                <li>Smart notifications</li>
                <li>Voice assistant integration</li>
                <li>Secure user authentication</li>
              </ul>
            </div>
            
            <div className="p-3 bg-success/10 rounded-lg border border-success/20">
              <p className="text-xs text-success-foreground">
                ✨ Built with React, TypeScript, and Google's Gemini AI
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Notifications */}
      <SmartNotifications />

      {/* Notification Test Panel */}
      <NotificationTest />
    </div>
  );
} 