"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import InstructorHeader from "@/components/Instructor-Header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { _axios } from "@/lib/axios";
import { useAuthStore } from "@/lib/store/auth-store";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  Trash2,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  category: string;
  students?: number;
  published?: boolean;
  is_published?: boolean;
  image?: string;
  thumbnail?: string;
  total_students?: number;
  sections?: any[];
  total_lessons?: number;
  total_duration?: string;
  course_progress?: {
    completed_lessons?: number;
    total_lessons?: number;
    percent_complete?: number;
  };
  user_data?: {
    is_enrolled: boolean;
    is_instructor: boolean;
    is_favorited: boolean;
    progress_percentage: number;
    has_access: boolean;
  };
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export default function InstructorCoursesPage() {
  const { user } = useAuthStore();
  const [courseToPublish, setCourseToPublish] = useState<string | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["instructor-courses-all"],
    queryFn: async () => {
      const response = await _axios.get("/courses/", {
        params: {
          instructor: user?.staff_id,
        },
      });
      return response.data;
    },
    enabled: !!user?.staff_id,
  });

  const publishMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const response = await _axios.put(`/courses/${courseId}/`, {
        is_published: true,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Course published successfully");
      refetch();
      setCourseToPublish(null);
    },
    onError: () => {
      toast.error("Failed to publish course");
      setCourseToPublish(null);
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const response = await _axios.put(`/courses/${courseId}/`, {
        is_published: false,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Course unpublished successfully");
      refetch();
    },
    onError: () => {
      toast.error("Failed to unpublish course");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const response = await _axios.put(`/courses/${courseId}/`, {
        is_active: false,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Course deleted successfully");
      refetch();
      setCourseToDelete(null);
    },
    onError: () => {
      toast.error("Failed to delete course");
      setCourseToDelete(null);
    },
  });

  const handlePublish = (courseId: string) => {
    publishMutation.mutate(courseId);
  };

  // Use all courses and slice for current page
  const allCourses = (data?.data || []).filter(
    (c: any) => c.is_active !== false
  );
  const totalCourses = allCourses.length;
  const totalPages = Math.max(1, Math.ceil(totalCourses / pageSize));
  const paginatedCourses = allCourses.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const getTotalVideos = (course: Course): number => {
    if (!course.sections) return 0;

    return course.sections.reduce((total, section) => {
      const videoLessons =
        section.lessons?.filter((lesson: any) => lesson.type === "video") || [];
      return total + videoLessons.length;
    }, 0);
  };

  const getTotalDuration = (course: any): string => {
    if (!course.sections) return "00:00";

    if (course.total_duration) return course.total_duration;

    let totalMinutes = 0;
    let totalSeconds = 0;

    course.sections.forEach((section: any) => {
      if (!section.lessons) return;

      section.lessons.forEach((lesson: any) => {
        if (lesson.type === "video" && lesson.duration) {
          const [minutes, seconds] = lesson.duration.split(":").map(Number);
          totalMinutes += minutes;
          totalSeconds += seconds;
        }
      });
    });

    totalMinutes += Math.floor(totalSeconds / 60);
    totalSeconds = totalSeconds % 60;

    return `${totalMinutes.toString().padStart(2, "0")}:${totalSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <p className="text-destructive">
            Failed to load courses. Please try again.
          </p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mx-6">
      <InstructorHeader />

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Manage Courses</h1>
          <p className="text-muted-foreground">
            View, edit, and organize your courses.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/instructor/courses/new">
            <Plus className="mr-2 h-4 w-4" />
            Create New Course
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Courses</CardTitle>
          <CardDescription>All courses you have created.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Category
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Students
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Content
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCourses.map((course: any) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-16 overflow-hidden rounded-md">
                          <img
                            src={
                              course.thumbnail ||
                              "/placeholder.svg?height=150&width=250"
                            }
                            alt={course.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{course.title}</p>
                          <p className="text-xs text-muted-foreground md:hidden">
                            {course.category || "Uncategorized"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {course.category || "Uncategorized"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {(course.total_students || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="text-xs">
                        <p>
                          {course.total_lessons || getTotalVideos(course)}{" "}
                          videos
                        </p>
                        <p className="text-muted-foreground">
                          {course?.total_duration} total
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          course.is_published
                            ? "text-green-600 font-medium"
                            : "text-muted-foreground"
                        }
                      >
                        {course.is_published ? "Published" : "Draft"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* Publish/Unpublish logic */}
                        {!course.is_published ? (
                          <AlertDialog
                            open={courseToPublish === course.id}
                            onOpenChange={(open) => {
                              if (!open) setCourseToPublish(null);
                            }}
                          >
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="default"
                                size="icon"
                                className="cursor-pointer"
                                onClick={() => setCourseToPublish(course.id)}
                                disabled={publishMutation.isPending}
                              >
                                <UploadCloud className="h-4 w-4" />
                                <span className="sr-only">Publish</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Publish Course
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to publish "
                                  {course.title}"? This will make the course
                                  visible to all students. Make sure all your
                                  course content is complete.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handlePublish(course.id)}
                                  disabled={publishMutation.isPending}
                                  className={
                                    publishMutation.isPending
                                      ? "opacity-70 cursor-not-allowed"
                                      : ""
                                  }
                                >
                                  {publishMutation.isPending
                                    ? "Publishing..."
                                    : "Publish"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <AlertDialog
                            open={courseToPublish === course.id}
                            onOpenChange={(open) => {
                              if (!open) setCourseToPublish(null);
                            }}
                          >
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="secondary"
                                size="icon"
                                className="cursor-pointer"
                                onClick={() => setCourseToPublish(course.id)}
                                disabled={unpublishMutation.isPending}
                              >
                                <UploadCloud className="h-4 w-4 rotate-180" />
                                <span className="sr-only">Unpublish</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Unpublish Course
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to unpublish "
                                  {course.title}"? This will hide the course
                                  from students but you will still see it.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    unpublishMutation.mutate(course.id)
                                  }
                                  disabled={unpublishMutation.isPending}
                                  className={
                                    unpublishMutation.isPending
                                      ? "opacity-70 cursor-not-allowed"
                                      : ""
                                  }
                                >
                                  {unpublishMutation.isPending
                                    ? "Unpublishing..."
                                    : "Unpublish"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        {/* Trash/Delete button */}
                        <AlertDialog
                          open={courseToDelete === course.id}
                          onOpenChange={(open) => {
                            if (!open) setCourseToDelete(null);
                          }}
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="cursor-pointer"
                              onClick={() => setCourseToDelete(course.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Course</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to permanently delete "
                                {course.title}"? This action cannot be undone.
                                The course will be hidden from all users.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(course.id)}
                                disabled={deleteMutation.isPending}
                                className={
                                  deleteMutation.isPending
                                    ? "opacity-70 cursor-not-allowed"
                                    : ""
                                }
                              >
                                {deleteMutation.isPending
                                  ? "Deleting..."
                                  : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {allCourses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-muted-foreground mb-2">
                        You haven't created any courses yet
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/instructor/courses/new">
                          <Plus className="mr-2 h-4 w-4" />
                          Create Your First Course
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalCourses > 0 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium">{(page - 1) * pageSize + 1}</span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(page * pageSize, totalCourses)}
              </span>{" "}
              of <span className="font-medium">{totalCourses}</span> courses
            </p>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setPage(1)}
              disabled={page === 1}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center justify-center text-sm font-medium">
              Page {page} of {totalPages}
            </div>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page >= totalPages}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
