"use client";

import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface NotificationCounterProps {
  className?: string;
}

export function NotificationCounter({ className }: NotificationCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const handleNotification = () => {
      setCount((prev) => prev + 1);
    };

    // Listen for notifications
    window.addEventListener("notification", handleNotification);

    return () => {
      window.removeEventListener("notification", handleNotification);
    };
  }, []);

  const handleClick = () => {
    // Reset counter when clicked
    setCount(0);
    // Here you would navigate to notifications page or open a dropdown
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("relative", className)}
      onClick={handleClick}
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <Badge
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
          variant="destructive"
        >
          {count > 9 ? "9+" : count}
        </Badge>
      )}
    </Button>
  );
}
