"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useStreakStore } from "@/lib/store/streakstore";
import { CalendarIcon, FlameIcon, TrendingUpIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function StreakStats() {
  const { streak, loginDates } = useStreakStore();
  const [stats, setStats] = useState({
    totalDays: 0,
    thisMonth: 0,
    bestStreak: 0,
    lastWeek: 0,
  });

  useEffect(() => {
    // Calculate streak statistics
    if (loginDates && loginDates.length > 0) {
      const today = new Date();
      const thisMonth = today.getMonth();
      const thisYear = today.getFullYear();

      // Total days with activity
      const totalDays = loginDates.length;

      // Days this month
      const daysThisMonth = loginDates.filter((day) => {
        const date = new Date(day.date);
        return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
      }).length;

      // Calculate best streak
      let bestStreak = streak;
      let currentStreak = 0;
      let prevDate: Date | null = null;

      // Sort dates chronologically
      const sortedDates = [...loginDates].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      for (const day of sortedDates) {
        const currentDate = new Date(day.date);

        if (prevDate) {
          const diffDays = Math.floor(
            (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (diffDays === 1) {
            // Consecutive day
            currentStreak++;
            bestStreak = Math.max(bestStreak, currentStreak);
          } else if (diffDays > 1) {
            // Streak broken
            currentStreak = 1;
          }
        } else {
          currentStreak = 1;
        }

        prevDate = currentDate;
      }

      // Days active in last week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const lastWeekDays = loginDates.filter((day) => {
        const date = new Date(day.date);
        return date >= oneWeekAgo && date <= today;
      }).length;

      setStats({
        totalDays,
        thisMonth: daysThisMonth,
        bestStreak: bestStreak,
        lastWeek: lastWeekDays,
      });
    }
  }, [loginDates, streak]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FlameIcon className="h-5 w-5 text-orange-500" />
          Your Learning Streak
        </CardTitle>
        <CardDescription>Track your consistency and progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center justify-center p-3 border rounded-md">
                  <FlameIcon className="h-5 w-5 text-orange-500 mb-1" />
                  <span className="text-2xl font-bold">{streak}</span>
                  <span className="text-sm text-muted-foreground">
                    Current Streak
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Your current consecutive days streak</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center justify-center p-3 border rounded-md">
                  <TrendingUpIcon className="h-5 w-5 text-green-500 mb-1" />
                  <span className="text-2xl font-bold">{stats.bestStreak}</span>
                  <span className="text-sm text-muted-foreground">
                    Best Streak
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Your longest consecutive days streak</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center justify-center p-3 border rounded-md">
                  <CalendarIcon className="h-5 w-5 text-blue-500 mb-1" />
                  <span className="text-2xl font-bold">{stats.thisMonth}</span>
                  <span className="text-sm text-muted-foreground">
                    This Month
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Days active this month</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center justify-center p-3 border rounded-md">
                  <CalendarIcon className="h-5 w-5 text-purple-500 mb-1" />
                  <span className="text-2xl font-bold">{stats.totalDays}</span>
                  <span className="text-sm text-muted-foreground">
                    Total Active Days
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Your total lifetime active days</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Activity Calendar</h4>
          <div className="flex flex-wrap gap-1">
            {loginDates.slice(-28).map((day) => {
              const date = new Date(day.date);
              const intensity = Math.min(Math.ceil(day.count / 2), 3);

              return (
                <TooltipProvider key={day.date}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`w-5 h-5 rounded-sm ${
                          intensity === 0
                            ? "bg-muted"
                            : intensity === 1
                            ? "bg-primary/30"
                            : intensity === 2
                            ? "bg-primary/60"
                            : "bg-primary"
                        }`}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {date.toLocaleDateString()} - {day.count} activities
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
