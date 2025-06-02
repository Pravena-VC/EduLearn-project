"use client";

import DashboardStreakWidget from "@/components/dashboard-streak-widget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { _axios } from "@/lib/axios";
import { useAuthStore } from "@/lib/store/auth-store";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CandidateDashboardPage() {
  const [progress, setProgress] = useState(0);
  const [streakDays, setStreakDays] = useState(5);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCourses, setAiCourses] = useState<any>([]);

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(78), 500);
    return () => clearTimeout(timer);
  }, []);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["myCourses"],
    queryFn: async () => {
      const response = await _axios.get("/my-courses/");
      return response.data;
    },
  });

  const myCourses = data?.data?.courses || [];

  const generateCalendarDays = () => {
    const today = new Date();
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      days.push({
        date: date,
        active: i < streakDays,
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  const handleAiTabClick = () => {
    setAiLoading(true);
    setTimeout(() => {
      const shuffledCourses = [...myCourses].sort(() => 0.5 - Math.random());
      const selectedCourses = shuffledCourses.slice(
        0,
        Math.floor(Math.random() * 3) + 2
      );
      setAiCourses(selectedCourses);
      setAiLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 mx-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Hello there, {user?.username}
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Continue your learning journey.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button asChild>
            <Link href="/dashboard/candidate/courses">Browse All Courses</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <DashboardStreakWidget />
      </div>

      <Tabs defaultValue="in-progress" className="space-y-4">
        <TabsList>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="recommended" onClick={handleAiTabClick}>
            AI Recommended
          </TabsTrigger>
        </TabsList>

        <TabsContent value="in-progress" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <Skeleton className="aspect-video w-full" />
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full mt-2" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <Skeleton className="h-4 w-1/4" />
                          <Skeleton className="h-4 w-1/6" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                        <Skeleton className="h-4 w-1/2 mt-2" />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))
              : myCourses.map((course: any) => (
                  <Card key={course.id} className="overflow-hidden">
                    <div className="aspect-video relative">
                      <img
                        src={course.thumbnail || "/placeholder.svg"}
                        alt={course.title}
                        className="object-cover w-full h-[200px]"
                      />
                      <Badge className="absolute top-2 right-2">
                        {course.category}
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-1">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          Last accessed{" "}
                          {new Date(
                            course.enrollment_date
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href={`/courses/${course.id}`}>
                          Continue Learning
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
          </div>
        </TabsContent>

        <TabsContent value="recommended" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {aiLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <Skeleton className="aspect-video w-full" />
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full mt-2" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Our AI is working on your courses...
                      </p>
                      <Skeleton className="h-4 w-1/4 mt-2" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))
              : aiCourses.map((course: any) => (
                  <Card key={course.id} className="overflow-hidden">
                    <div className="aspect-video relative">
                      <img
                        src={course.thumbnail || "/placeholder.svg"}
                        alt={course.title}
                        className="object-cover w-full h-[200px]"
                      />
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full">
                        {Math.floor(Math.random() * 30) + 70}% Match
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-1">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="outline">{course.category}</Badge>
                      <p className="text-sm text-muted-foreground mt-2">
                        Check this out! Our AI thinks you'll love this course!
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" asChild className="w-full">
                        <Link href={`/courses/${course.id}`}>View Course</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
