"use client";

import InstructorHeader from "@/components/Instructor-Header";
import { Badge } from "@/components/ui/badge";
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
import { _axios } from "@/lib/axios";
import { useAuthStore } from "@/lib/store/auth-store";
import {
  BarChart3,
  DollarSign,
  Eye,
  Plus,
  Star,
  TrendingUp,
  Users2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function InstructorDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    averageRating: 0,
    monthlyCourseViews: 0,
  });
  const [courses, setCourses] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 5;

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchInstructorData = async () => {
      try {
        if (!user || !user.staff_id) {
          setIsLoading(false);
          return;
        }

        const coursesResponse = await _axios.get("/courses/", {
          params: { instructor: user.staff_id },
        });

        const statsResponse = await _axios.get("/instructor/stats/");

        if (coursesResponse.data && coursesResponse.data.success) {
          const coursesData = coursesResponse.data.data || [];

          const transformedCourses = coursesData.map((course: any) => ({
            id: course.id,
            title: course.title,
            category: course.category || "Uncategorized",
            students: course.total_students || 0,
            revenue: course.price * (course.total_students || 0),
            rating: course.average_rating || 0,
            published: course.is_published,
            image: course.thumbnail || "/placeholder.svg?height=150&width=250",
          }));

          setCourses(transformedCourses);
        }

        if (statsResponse.data && statsResponse.data.success) {
          const statsData = statsResponse.data.data || {};

          setStats({
            totalCourses: statsData.total_courses || 0,
            totalStudents: statsData.total_students || 0,
            totalRevenue: statsData.total_revenue || 0,
            averageRating: statsData.average_rating || 0,
            monthlyCourseViews: statsData.monthly_course_views || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching instructor data:", error);
        setStats({
          totalCourses: courses.length,
          totalStudents: 0,
          totalRevenue: 0,
          averageRating: 0,
          monthlyCourseViews: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstructorData();
  }, []);

  const revenueData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        data: [1200, 1900, 3000, 3200, 2800, 5000],
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mx-6">
      <InstructorHeader />
      <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Instructor Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your courses, track performance, and analyze student
            engagement
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/dashboard/instructor/courses/new">
              <Plus className="mr-2 h-4 w-4" />
              Create New Course
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-3xl font-bold">
                  {stats.totalStudents.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users2 className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-green-500 font-medium">+12%</span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold">
                  {stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-green-500 font-medium">+12%</span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Courses</p>
                <p className="text-3xl font-bold">
                  {stats.totalCourses.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-green-500 font-medium">+23%</span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Course Views</p>
                <p className="text-3xl font-bold">
                  {stats.monthlyCourseViews.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Eye className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-green-500 font-medium">+18%</span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">Your Courses</CardTitle>
              <CardDescription>
                Manage and monitor all your courses
              </CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard/instructor/courses">View All</Link>
            </Button>
          </div>
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
                  <TableHead>Revenue</TableHead>
                  <TableHead className="hidden md:table-cell">Rating</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      <p className="text-muted-foreground">
                        You don't have any courses yet.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        size="sm"
                        asChild
                      >
                        <Link href="/dashboard/instructor/courses/new">
                          <Plus className="mr-2 h-4 w-4" />
                          Create your first course
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  courses
                    .slice(
                      (currentPage - 1) * coursesPerPage,
                      currentPage * coursesPerPage
                    )
                    .map((course) => (
                      <TableRow key={course.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-16 overflow-hidden rounded-md">
                              <img
                                src={course.image}
                                alt={course.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium">{course.title}</p>
                              <p className="text-xs text-muted-foreground md:hidden">
                                {course.category}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {course.category}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {course.students.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          $
                          {course.revenue.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {course.rating > 0 ? (
                            <div className="flex items-center">
                              <span>{course.rating.toFixed(1)}</span>
                              <Star className="ml-1 h-4 w-4 text-yellow-500 fill-yellow-500" />
                            </div>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={course.published ? "default" : "secondary"}
                          >
                            {course.published ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {courses.length > coursesPerPage && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing{" "}
                {Math.min(
                  (currentPage - 1) * coursesPerPage + 1,
                  courses.length
                )}{" "}
                to {Math.min(currentPage * coursesPerPage, courses.length)} of{" "}
                {courses.length} courses
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(
                        prev + 1,
                        Math.ceil(courses.length / coursesPerPage)
                      )
                    )
                  }
                  disabled={
                    currentPage >= Math.ceil(courses.length / coursesPerPage)
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activities */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="text-xl">Recent Activities</CardTitle>
          <CardDescription>
            Recent activities related to your courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {[
              {
                type: "enrollment",
                message:
                  "5 new students enrolled in Advanced JavaScript Patterns",
                time: "15 minutes ago",
              },
              {
                type: "review",
                message: "New 5-star review on React & Redux Mastery",
                time: "2 hours ago",
              },
              {
                type: "question",
                message: "New question in DevOps and CI/CD Pipelines course",
                time: "5 hours ago",
              },
              {
                type: "milestone",
                message:
                  "Your SQL Database Design course reached 750 students!",
                time: "1 day ago",
              },
              {
                type: "earning",
                message: "You earned $350 from course sales this week",
                time: "2 days ago",
              },
            ].map((activity, i) => (
              <div key={i} className="flex gap-4">
                <div className="mt-1">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {activity.type === "enrollment" && (
                      <Users2 className="h-4 w-4 text-primary" />
                    )}
                    {activity.type === "review" && (
                      <Star className="h-4 w-4 text-primary" />
                    )}
                    {activity.type === "question" && (
                      <BookOpen className="h-4 w-4 text-primary" />
                    )}
                    {activity.type === "milestone" && (
                      <TrendingUp className="h-4 w-4 text-primary" />
                    )}
                    {activity.type === "earning" && (
                      <DollarSign className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
