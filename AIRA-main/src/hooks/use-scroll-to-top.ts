import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Only scroll to top when navigating to the dashboard (home page)
    // This prevents unwanted scrolling when navigating between other sections
    if (pathname === '/') {
      // Small delay to ensure the page has loaded
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [pathname]);
}

// New hook for manual scroll to top
export function useManualScrollToTop() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  };

  return scrollToTop;
}

// Hook to preserve scroll position
export function usePreserveScrollPosition() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Save scroll position when leaving a page
    const handleBeforeUnload = () => {
      sessionStorage.setItem(`scroll-${pathname}`, window.scrollY.toString());
    };

    // Restore scroll position when entering a page
    const savedScroll = sessionStorage.getItem(`scroll-${pathname}`);
    if (savedScroll && pathname !== '/') {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScroll));
      }, 100);
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pathname]);
} 