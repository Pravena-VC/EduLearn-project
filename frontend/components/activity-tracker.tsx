"use client";

import { useAuthStore } from "@/lib/store/auth-store";
import { useStreakStore } from "@/lib/store/streakstore";
import { useStreakAchievements } from "@/lib/streak-utils";
import { useEffect } from "react";

export default function ActivityTracker() {
  const user = useAuthStore((state) => state.user);
  const recordLogin = useStreakStore((state) => state.recordLogin);
  const streak = useStreakStore((state) => state.streak);

  useEffect(() => {
    if (!user) return;

    // Check streak achievements when streak changes
    const { checkMilestone } = useStreakAchievements();
    checkMilestone();

    // Record initial login
    recordLogin();

    // Set up activity tracking
    const trackActivity = () => {
      sessionStorage.setItem("lastActivity", Date.now().toString());
    };

    // Track significant user activities
    document.addEventListener("click", trackActivity);
    document.addEventListener("keypress", trackActivity);
    document.addEventListener("mousemove", debounce(trackActivity, 1000));
    document.addEventListener("scroll", debounce(trackActivity, 1000));

    // Initial activity record
    trackActivity();

    // Periodically check if we should increment streak
    const checkInterval = setInterval(() => {
      const lastActivity = sessionStorage.getItem("lastActivity");
      if (lastActivity) {
        const lastActivityTime = parseInt(lastActivity, 10);
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;

        if (now - lastActivityTime < fiveMinutes) {
          recordLogin();
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => {
      document.removeEventListener("click", trackActivity);
      document.removeEventListener("keypress", trackActivity);
      document.removeEventListener("mousemove", debounce(trackActivity, 1000));
      document.removeEventListener("scroll", debounce(trackActivity, 1000));
      clearInterval(checkInterval);
    };
  }, [user, recordLogin]);

  // Nothing to render - this is just for tracking
  return null;
}

// Helper function to limit event firing frequency
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
