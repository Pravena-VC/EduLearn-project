"use client";

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
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { _axios } from "@/lib/axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import CandidateHeader from "@/components/candidate-header";
import { Skeleton } from "@/components/ui/skeleton";

function CourseCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[200px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["myCourses"],
    queryFn: async () => {
      const response = await _axios.get("/my-courses/");
      return response.data;
    },
  });

  const { mutate: removeFavoriteData, isPending } = useMutation({
    mutationFn: async (courseId: string) => {
      const response = await _axios.post(`/remove-favorite-course/${courseId}`);
      return response.data;
    },
    onSuccess: () => {
      refetch();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-8 mx-8">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <Skeleton className="h-10 w-full md:w-[180px]" />
          <Skeleton className="h-10 w-full md:w-[180px]" />
          <Skeleton className="h-10 w-full md:w-[180px]" />
        </div>

        <div className="space-y-6">
          <Skeleton className="h-10 w-96" />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <CourseCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const myCourses = data?.data?.courses || [];
  const savedCourses = data?.data?.favorites || [];
  const completedCourses = data?.data?.completed_courses || [];

  // Remove courses that are in completedCourses from myCourses
  const completedCourseIds = new Set(completedCourses.map((c: any) => c.id));
  const enrolledCourses = myCourses.filter(
    (course: any) => !completedCourseIds.has(course.id)
  );

  // Filtered courses for enrolled tab
  const filteredCourses: any = enrolledCourses.filter((course: any) => {
    if (
      searchQuery &&
      !course.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !course.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (categoryFilter !== "all" && course.category !== categoryFilter) {
      return false;
    }
    if (
      statusFilter !== "all" &&
      course.completed !== (statusFilter === "completed")
    ) {
      return false;
    }
    return true;
  });

  const categories = [
    "all",
    ...new Set(myCourses.map((course: any) => course.category)),
  ];

  return (
    <div className="space-y-8 mx-8">
      <CandidateHeader />
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">My Courses</h1>
        <p className="text-muted-foreground mt-1">
          Access and manage all your enrolled and saved courses
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search courses..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category: any) => (
              <SelectItem key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="not-started">Not Started</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="enrolled" className="space-y-6">
        <TabsList>
          <TabsTrigger value="enrolled">
            Enrolled ({enrolledCourses.length})
          </TabsTrigger>
          <TabsTrigger value="saved">Saved ({savedCourses.length})</TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedCourses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enrolled" className="space-y-6">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <Search className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium mt-4">No courses found</h3>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                We couldn't find any courses matching your filters. Try
                adjusting your search criteria.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                  setStatusFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course: any) => (
                <Card key={course.id} className="flex flex-col overflow-hidden">
                  <div className="aspect-video relative">
                    <img
                      src={course.thumbnail || "/placeholder.svg"}
                      alt={course.title}
                      className="h-[200px] w-full object-cover"
                    />
                    <Badge
                      className="absolute top-2 right-2"
                      variant={course.completed ? "default" : "secondary"}
                    >
                      {course.completed ? "Completed" : "In Progress"}
                    </Badge>
                  </div>

                  <CardHeader className="pb-2">
                    <CardTitle className="line-clamp-1">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pb-2 flex-grow">
                    <div className="flex justify-between text-sm">
                      <div className="text-muted-foreground flex w-full items-center justify-between">
                        <p className="font-bold">Instructor</p> -{" "}
                        {course.instructor.name}
                      </div>
                    </div>

                    {/* {!course.completed && (
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div> */}
                  </CardContent>

                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/courses/${course.id}`}>
                        {course.completed ? "Review Course" : "Continue Course"}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {savedCourses.map((course: any) => (
              <Card key={course.id} className="flex flex-col overflow-hidden">
                <div className="aspect-video relative">
                  <img
                    src={course.thumbnail || "/placeholder.svg"}
                    alt={course.title}
                    className="h-[200px] w-full object-cover"
                  />
                  <Badge className="absolute top-2 right-2" variant="outline">
                    Saved
                  </Badge>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pb-2 flex-grow">
                  <div className="flex justify-between text-sm">
                    <div className="text-muted-foreground flex w-full items-center justify-between">
                      <p className="font-bold">Instructor</p> -{" "}
                      {course.instructor.name}
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <Badge variant="secondary">{course.category}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {completedCourses.map((course: any) => (
              <Card key={course.id} className="flex flex-col overflow-hidden">
                <div className="aspect-video relative">
                  <img
                    src={course.thumbnail || "/placeholder.svg"}
                    alt={course.title}
                    className="h-[200px] w-full object-cover"
                  />
                  <Badge className="absolute top-2 right-2">Completed</Badge>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pb-2 flex-grow">
                  <div className="flex justify-between text-sm">
                    <div className="text-muted-foreground">
                      {course.instructor.name}
                    </div>
                  </div>

                  <div className="mt-4 space-y-1">
                    <Progress value={100} className="h-2 bg-green-200" />
                    <div className="flex justify-between text-sm">
                      <span>
                        Lessons: {course.completed_lessons}/
                        {course.total_lessons}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
