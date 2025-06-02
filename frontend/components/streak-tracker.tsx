"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthStore } from "@/lib/store/auth-store";
import { useStreakStore } from "@/lib/store/streakstore";
import { Flame as FlameIcon } from "lucide-react";
import { useEffect, useState } from "react";

// Create a global tracker for page activities that different components can use
export const recordActivityEvent = () => {
  const streakStore = useStreakStore.getState();
  streakStore.recordLogin();
};

export default function StreakTracker({
  variant = "default",
}: {
  variant?: "default" | "compact";
}) {
  const { streak, loginDates, recordLogin, getWeekStreak, hasVisitedToday } =
    useStreakStore();
  const [weekDays, setWeekDays] = useState<
    Array<{ date: string; count: number; day: string }>
  >([]);
  const user = useAuthStore((state) => state.user);
  const [isClient, setIsClient] = useState(false);

  // Ensure hydration safety
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Record login on component mount if user is logged in
  useEffect(() => {
    if (user && !hasVisitedToday()) {
      recordLogin();

      // Additionally, set up an interval to check for user activity
      const activityInterval = setInterval(() => {
        // Record activity if user has been active in the last 5 minutes
        // This ensures streak continues during longer sessions
        const lastActivity = sessionStorage.getItem("lastActivity");
        if (lastActivity) {
          const lastActivityTime = parseInt(lastActivity, 10);
          const now = Date.now();
          const fiveMinutes = 5 * 60 * 1000;

          if (now - lastActivityTime < fiveMinutes) {
            recordLogin();
          }
        }
      }, 10 * 60 * 1000); // Check every 10 minutes

      return () => clearInterval(activityInterval);
    }
  }, [user, recordLogin, hasVisitedToday]);

  // Get current week days with formatting
  useEffect(() => {
    if (!user) return;

    const weekStreak = getWeekStreak();
    const formatted = weekStreak.map((day) => {
      const date = new Date(day.date);
      const dayName = date
        .toLocaleDateString("en-US", { weekday: "short" })
        .substring(0, 1);
      return {
        ...day,
        day: dayName,
      };
    });

    setWeekDays(formatted);
  }, [user, getWeekStreak, loginDates]);

  if (!user || !isClient) return null;

  // If compact variant, show simplified version
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="flex items-center gap-1 h-7">
                <FlameIcon className="h-3 w-3 text-orange-500" />
                {streak}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="w-64">
              <p className="font-medium mb-1">
                {streak > 0
                  ? `You're on a ${streak}-day learning streak! 🔥`
                  : "Start your learning streak today! 🔥"}
              </p>
              <div className="flex items-center justify-center gap-1 pt-1">
                {weekDays.map((day, index) => {
                  const isToday =
                    new Date().toISOString().split("T")[0] === day.date;
                  const hasActivity = day.count > 0;

                  return (
                    <div
                      key={day.date}
                      className={`
                        w-7 h-7 rounded-md flex flex-col items-center justify-center text-xs
                        ${
                          hasActivity
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }
                        ${isToday && "ring-2 ring-offset-1 ring-primary"}
                      `}
                    >
                      <span className="text-[9px]">{day.day}</span>
                      {hasActivity && <span className="text-[7px]">✓</span>}
                    </div>
                  );
                })}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  // Regular full version
  return (
    <div className="flex items-center gap-1 mr-2">
      <TooltipProvider>
        <div className="flex items-center gap-1">
          {weekDays.map((day, index) => {
            const isToday = new Date().toISOString().split("T")[0] === day.date;
            const hasActivity = day.count > 0;

            return (
              <Tooltip key={day.date}>
                <TooltipTrigger asChild>
                  <div
                    className={`
                      w-5 h-5 rounded-full flex items-center justify-center text-xs
                      ${
                        hasActivity
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }
                      ${isToday && "ring-2 ring-offset-1 ring-primary"}
                    `}
                  >
                    {day.day}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>
                    {new Date(day.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                    {hasActivity
                      ? ` - ${day.count} activities`
                      : " - No activity"}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>

      <Badge variant="outline" className="ml-1">
        🔥 {streak} days
      </Badge>
    </div>
  );
}
