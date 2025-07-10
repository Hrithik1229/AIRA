import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { KeyboardShortcuts } from "./components/ui/keyboard-shortcuts";
import { QuickActions } from "./components/ui/quick-actions";
import { WelcomeTour } from "./components/ui/welcome-tour";
import Analytics from "./pages/Analytics";
import Auth from "./pages/Auth";
import Goals from "./pages/Goals";
import History from "./pages/History";
import Index from "./pages/Index";
import { Landing } from "./pages/Landing";
import Mood from "./pages/Mood";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import Tasks from "./pages/Tasks";
import Wellness from "./pages/Wellness";
import { authService } from "./services/auth-service";

const queryClient = new QueryClient();

// Global scroll management
function useGlobalScrollManagement() {
  const location = useLocation();

  useEffect(() => {
    // Only scroll to top for dashboard, let other pages maintain their scroll position
    if (location.pathname === '/') {
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 50);
    }
  }, [location.pathname]);
}

function AppContent() {
  const navigate = useNavigate();
  const [showLanding, setShowLanding] = useState(true);
  const [showWelcomeTour, setShowWelcomeTour] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Use global scroll management
  useGlobalScrollManagement();

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleEnterApp = () => {
    setShowLanding(false);
    // Check if user is new and show welcome tour
    const tourCompleted = localStorage.getItem('aira-tour-completed');
    if (!tourCompleted) {
      setTimeout(() => setShowWelcomeTour(true), 1000);
    }
  };

  const handleQuickMood = () => {
    // This will be handled by the dashboard
    navigate('/mood');
  };

  const handleQuickTask = () => {
    navigate('/tasks');
  };

  const handleAuthSuccess = (user: any) => {
    setIsAuthenticated(true);
    navigate('/');
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    navigate('/auth');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading AIRA...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show auth page
  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  if (showLanding) {
    return (
      <>
        <Landing onEnterApp={handleEnterApp} />
        <KeyboardShortcuts onNavigate={navigate} />
      </>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout onLogout={handleLogout} />
          </ProtectedRoute>
        }>
          <Route index element={<Index />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="goals" element={<Goals />} />
          <Route path="mood" element={<Mood />} />
          <Route path="wellness" element={<Wellness />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="history" element={<History />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Global Components */}
      <KeyboardShortcuts onNavigate={navigate} />
      <QuickActions 
        onNavigate={navigate}
        onQuickMood={handleQuickMood}
        onQuickTask={handleQuickTask}
      />
      <WelcomeTour 
        isOpen={showWelcomeTour} 
        onClose={() => setShowWelcomeTour(false)} 
      />
    </>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
