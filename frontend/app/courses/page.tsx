"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CourseFilters,
  CoursePreview,
  getPublicCourses,
} from "@/lib/api/courses-api";
import { useAuthStore } from "@/lib/store/auth-store";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Clock, Search, Star, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(9);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filters: CourseFilters = {
    page: currentPage,
    page_size: pageSize,
    search: debouncedSearch || undefined,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    level: levelFilter !== "all" ? levelFilter : undefined,
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["courses", filters],
    queryFn: () => getPublicCourses(filters),
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(searchQuery);
    setCurrentPage(1);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} className="w-4 h-4 fill-primary text-primary" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative w-4 h-4">
          <Star className="w-4 h-4 absolute text-primary" />
          <div className="absolute w-[50%] h-4 overflow-hidden">
            <Star className="w-4 h-4 fill-primary text-primary" />
          </div>
        </div>
      );
    }

    const emptyStars = 5 - (fullStars + (hasHalfStar ? 1 : 0));
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-muted-foreground" />
      );
    }

    return stars;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <section className="w-full py-8 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
            <form
              onSubmit={handleSearchSubmit}
              className="flex w-full md:w-auto items-center gap-2"
            >
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search courses..."
                  className="pl-8 w-full md:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {data?.filters?.categories?.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {data?.filters?.levels?.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level.charAt(0).toUpperCase() +
                        level.slice(1).replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-sm text-muted-foreground mb-6">
            {isLoading
              ? "Loading courses..."
              : `Showing ${data?.pagination?.total_courses || 0} courses`}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-48 bg-muted">
                    <Skeleton className="h-full w-full" />
                  </div>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">Failed to load courses</h3>
              <p className="text-muted-foreground">Please try again later</p>
            </div>
          ) : data?.data?.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No courses found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.data.map((course: CoursePreview) => (
                <Link
                  href={`/courses/${course.id}`}
                  key={course.id}
                  onClick={(e) => {
                    if (!user) {
                      toast.info("Please log in to view course details.");
                      e.preventDefault();
                    }
                  }}
                >
                  <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-video relative overflow-hidden">
                      {course.thumbnail ? (
                        <Image
                          src={course.thumbnail}
                          alt={course.title}
                          fill
                          className="object-cover"
                          quality={80}
                        />
                      ) : (
                        <div className="h-full w-full bg-muted flex items-center justify-center">
                          <Image
                            src="/placeholder.jpg"
                            alt="Course placeholder"
                            width={400}
                            height={225}
                            className="object-cover"
                          />
                        </div>
                      )}
                      {course.is_featured && (
                        <Badge
                          className="absolute top-2 right-2"
                          variant="secondary"
                        >
                          Featured
                        </Badge>
                      )}
                    </div>

                    <CardContent className="p-2">
                      <div className="">
                        <Badge variant="outline">{course.level}</Badge>
                        {course.category && (
                          <Badge variant="outline" className="ml-2">
                            {course.category}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-bold mb-2 line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {course.short_description}
                      </p>

                      <div className="flex items-center gap-1 mb-1">
                        {renderStars(course.rating)}
                        <span className="text-sm ml-1">
                          {course.rating.toFixed(1)} ({course.rating_count})
                        </span>
                      </div>

                      <div className="flex items-center text-sm text-muted-foreground">
                        <div className="flex items-center mr-4">
                          <Users className="h-3.5 w-3.5 mr-1" />
                          <span>{course.total_students} students</span>
                        </div>
                        <div className="flex items-center">
                          <BookOpen className="h-3.5 w-3.5 mr-1" />
                          <span>{course.total_lessons} lessons</span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="flex justify-between items-center p-6 pt-0 border-t">
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {course.total_duration}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="font-bold">{"Free"}</div>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {data && data.pagination && data.pagination.total_pages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (data.pagination.has_previous) {
                        setCurrentPage(currentPage - 1);
                      }
                    }}
                    className={
                      !data.pagination.has_previous
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>

                {Array.from(
                  { length: data.pagination.total_pages },
                  (_, i) => i + 1
                )
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === data.pagination.total_pages ||
                      Math.abs(page - currentPage) <= 1
                  )
                  .map((page, i, filteredPages) => {
                    // Add ellipsis where needed
                    if (i > 0 && filteredPages[i] - filteredPages[i - 1] > 1) {
                      return [
                        <PaginationItem key={`ellipsis-${i}`}>
                          <span className="px-2">...</span>
                        </PaginationItem>,
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                            }}
                            isActive={page === currentPage}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>,
                      ];
                    }
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                          isActive={page === currentPage}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (data.pagination.has_next) {
                        setCurrentPage(currentPage + 1);
                      }
                    }}
                    className={
                      !data.pagination.has_next
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 bg-muted mt-auto">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Ready to Start Learning?
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join thousands of students and begin your learning journey
                today.
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-2 min-[400px]:gap-4">
              <Button size="lg" className="md:text-lg" asChild>
                <Link href="/register">Sign Up For Free</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="md:text-lg"
                asChild
              >
                <Link href="/courses">Browse All Courses</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
