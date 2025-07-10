import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Logo } from "@/components/ui/Logo";
import { authService } from "@/services/auth-service";
import { Lock, Shield, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface AuthProps {
  onAuthSuccess: (user: any) => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    if (authService.isAuthenticated()) {
      navigate("/");
    } else {
      setIsLoading(false);
    }
  }, [navigate]);

  const handleAuthSuccess = (user: any) => {
    // User is now authenticated, call parent callback
    onAuthSuccess(user);
  };

  const handleSwitchToRegister = () => {
    setIsLogin(false);
  };

  const handleSwitchToLogin = () => {
    setIsLogin(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Welcome content */}
        <div className="text-center lg:text-left space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <Logo size="xl" variant="animated" />
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Your Personal AI Assistant
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-md mx-auto lg:mx-0">
              Secure, private, and personalized. Your wellness journey starts here.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 max-w-md mx-auto lg:mx-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium">Secure & Private</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Lock className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium">End-to-End Encryption</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium">AI-Powered Insights</span>
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-6 max-w-md mx-auto lg:mx-0">
            <p className="text-sm text-muted-foreground italic mb-2">
              "AIRA has transformed how I manage my daily wellness. The voice assistant makes everything so natural and intuitive."
            </p>
            <p className="text-xs font-medium">- Sarah M., AIRA User</p>
          </div>
        </div>

        {/* Right side - Auth forms */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            {isLogin ? (
              <LoginForm 
                onSuccess={handleAuthSuccess}
                onSwitchToRegister={handleSwitchToRegister}
              />
            ) : (
              <RegisterForm 
                onSuccess={handleAuthSuccess}
                onSwitchToLogin={handleSwitchToLogin}
              />
            )}
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
} 