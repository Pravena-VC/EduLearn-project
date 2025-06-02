import { useStreakStore } from "@/lib/store/streakstore";
import { toast } from "sonner";

// Milestone streak days that trigger achievements
const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 365];

/**
 * Checks if a user has reached a streak milestone and shows a notification
 * @returns Object with checkMilestone function
 */
export const useStreakAchievements = () => {
  const checkMilestone = () => {
    const { streak } = useStreakStore.getState();

    // Check if the current streak matches any milestone
    if (STREAK_MILESTONES.includes(streak)) {
      // Get last notified milestone from localStorage
      const lastNotifiedMilestone = localStorage.getItem("lastStreakMilestone");

      // If we haven't notified for this milestone yet
      if (lastNotifiedMilestone !== streak.toString()) {
        let message = "";
        let description = "";

        // Customize messages based on milestone
        switch (streak) {
          case 3:
            message = "3-Day Streak! 🔥";
            description =
              "Great start! You've been learning for 3 consecutive days.";
            break;
          case 7:
            message = "7-Day Streak! 🔥🔥";
            description =
              "One week of consistent learning! Keep up the good work!";
            break;
          case 14:
            message = "2-Week Streak! 🔥🔥";
            description =
              "Two weeks of dedication! You're building great habits.";
            break;
          case 30:
            message = "30-Day Streak! 🏆";
            description =
              "Amazing! A full month of daily learning. You're unstoppable!";
            break;
          case 60:
            message = "60-Day Streak! 🏆🏆";
            description =
              "Two months of consistent learning? That's impressive commitment!";
            break;
          case 100:
            message = "100-Day Streak! 🌟";
            description =
              "INCREDIBLE! 100 days of learning. You're in the elite group now!";
            break;
          case 365:
            message = "365-Day Streak! 👑";
            description = "A FULL YEAR of daily learning! You're a legend!";
            break;
          default:
            break;
        }

        // Show toast notification
        toast(message, {
          description,
          duration: 10000,
        });

        // Save this milestone as notified
        localStorage.setItem("lastStreakMilestone", streak.toString());
      }
    }
  };

  return { checkMilestone };
};

/**
 * Checks if a user's streak is at risk (hasn't visited today)
 * @returns Functions to check and notify about streak risk
 */
export const useStreakReminders = () => {
  /**
   * Checks if user's streak is at risk and shows a notification if needed
   */
  const checkStreakRisk = () => {
    const { streak, hasVisitedToday } = useStreakStore.getState();

    // Only show reminder for streaks that matter (3+ days)
    if (streak >= 3 && !hasVisitedToday()) {
      // Check if we already reminded today
      const lastReminder = localStorage.getItem("lastStreakReminder");
      const today = new Date().toISOString().split("T")[0];

      if (lastReminder !== today) {
        toast("Don't break your streak! 🔥", {
          description: `You have a ${streak}-day streak going. Make sure to complete an activity today!`,
          duration: 0, // Don't auto-dismiss
        });

        // Save reminder time
        localStorage.setItem("lastStreakReminder", today);
      }
    }
  };

  return { checkStreakRisk };
};
