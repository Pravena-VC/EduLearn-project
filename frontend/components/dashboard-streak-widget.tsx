"use client";

import StreakStats from "@/components/streak-stats";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStreakStore } from "@/lib/store/streakstore";
import { FlameIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function DashboardStreakWidget() {
  const { streak, loginDates } = useStreakStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-4">
      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FlameIcon className="h-5 w-5 text-orange-500" />
              Your Learning Streak
            </div>
            <Badge
              variant="outline"
              className="text-orange-500 border-orange-200"
            >
              {formattedDate}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-1">
              <div className="text-2xl font-bold flex items-center gap-1">
                <FlameIcon className="h-5 w-5 text-orange-500" />
                {streak} {streak === 1 ? "day" : "days"}
              </div>
              <p className="text-sm text-muted-foreground">
                {streak > 0
                  ? `You're on a roll! Keep learning daily to maintain your streak.`
                  : "Start your streak today by completing a lesson or activity!"}
              </p>
            </div>

            <div className="flex items-center h-full">
              <div className="relative h-14 w-14 flex items-center justify-center">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="10"
                    strokeDasharray={`${Math.min(streak * 30, 283)} 283`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                  {streak}
                </div>
              </div>
            </div>
          </div>

          {streak > 0 && (
            <p className="text-xs text-center mt-4 text-muted-foreground">
              Next streak milestone:{" "}
              {streak < 7
                ? `7 days (${7 - streak} to go)`
                : streak < 30
                ? `30 days (${30 - streak} to go)`
                : streak < 100
                ? `100 days (${100 - streak} to go)`
                : "365 days"}
            </p>
          )}
        </CardContent>
      </Card>

      <StreakStats />
    </div>
  );
}
