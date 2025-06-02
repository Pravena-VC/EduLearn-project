"use client";

import ApplicationDialog from "@/components/application-dialog";
import CourseVideoPlayer from "@/components/course-video-player";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CourseViewer from "@/lib/api/course-viewer";
import { _axios } from "@/lib/axios";
import { useAuthStore } from "@/lib/store/auth-store";
import { useStreakStore } from "@/lib/store/streakstore";
import { useMutation, useQuery } from "@tanstack/react-query";

import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Heart,
  HeartOff,
  List,
  Loader2,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refetchApi, setRefetchApi] = useState(false);
  const [courseData, setCourseData] = useState<any>(null);
  const [currentLessonData, setCurrentLessonData] = useState<any | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  const [commentContent, setCommentContent] = useState("");

  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const { courseId } = React.use(params);

  const recordLogin = useStreakStore((state) => state.recordLogin);

  const { mutate: createDiscussion, isPending: isCreatingDiscussion } =
    useMutation({
      mutationFn: async (content: string) => {
        const response = await _axios.post(`/courses/${courseId}/comments/`, {
          content,
        });
        return response.data;
      },
      onSuccess: () => {
        toast.success("Discussion created successfully");
        refetchComments();
        setCommentContent("");
      },
      onError: () => {
        toast.error("Failed to create discussion");
      },
    });

  const { data: commentsData, refetch: refetchComments } = useQuery({
    queryKey: ["comments", courseId],
    queryFn: async () => {
      const response = await _axios.get(`/courses/${courseId}/comments/`);
      return response.data;
    },
  });

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const data = await CourseViewer.getCourseViewData(courseId);
        setCourseData(data);

        setIsFavorite(data.user_data?.is_favorite || false);

        if (data.user_data?.progress?.completed_lessons) {
          setCompletedLessons(data.user_data.progress.completed_lessons);
        } else {
          setCompletedLessons([]);
        }

        if (data.user_data?.progress?.current_lesson) {
          await loadLesson(data.user_data.progress.current_lesson);
        } else if (
          data.sections?.length > 0 &&
          data.sections[0].lessons?.length > 0
        ) {
          await loadLesson(data.sections[0].lessons[0].id);
        }

        setIsLoading(false);
      } catch (error: any) {
        console.error("Failed to load course:", error);
        toast("Error", {
          description: error.message || "Failed to load course data",
        });
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, user, refetchApi]);

  if (!user) {
    return (
      <div className="container mx-auto py-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-medium">Redirecting to login...</h2>
        </div>
      </div>
    );
  }

  const loadLesson = async (lessonId: number) => {
    try {
      const lessonData = await CourseViewer.getLessonDetails(lessonId);
      setCurrentLessonData(lessonData);
      return lessonData;
    } catch (error: any) {
      console.error("Failed to load lesson:", error);
      toast("Error", {
        description: error.message || "Failed to load lesson data",
      });
      return null;
    }
  };

  const toggleLessonCompletion = async (
    lessonId: number,
    completed: boolean
  ) => {
    try {
      const progress = await CourseViewer.markLessonProgress(
        lessonId,
        completed
      );

      if (completed) {
        setCompletedLessons((prev) => [...prev, lessonId]);

        recordLogin();
      } else {
        setCompletedLessons((prev) => prev.filter((id) => id !== lessonId));
      }

      if (courseData) {
        setCourseData({
          ...courseData,
          user_data: {
            ...courseData.user_data,
            progress: {
              ...courseData.user_data.progress,
              completed_lessons: completed
                ? [...courseData.user_data.progress.completed_lessons, lessonId]
                : courseData.user_data.progress.completed_lessons.filter(
                    (id: any) => id !== lessonId
                  ),
              percent_complete: progress.course_progress.percent_complete,
            },
          },
        });
      }
    } catch (error: any) {
      console.error("Failed to update lesson progress:", error);
      toast("Error", {
        description: error.message || "Failed to update lesson progress",
      });
    }
  };

  const navigateLesson = async (direction: "next" | "prev") => {
    if (!currentLessonData) return;

    try {
      let lessonToLoad: number | null = null;

      if (direction === "next" && currentLessonData.next_lesson) {
        lessonToLoad = currentLessonData.next_lesson.id;
      } else if (direction === "prev" && currentLessonData.prev_lesson) {
        lessonToLoad = currentLessonData.prev_lesson.id;
      }

      if (lessonToLoad) {
        await loadLesson(lessonToLoad);
      }
    } catch (error) {
      console.error(`Failed to navigate to ${direction} lesson:`, error);
    }
  };

  const handleVideoComplete = async () => {
    if (!currentLessonData) return;

    if (!completedLessons.includes(currentLessonData.id)) {
      await toggleLessonCompletion(currentLessonData.id, true);
    }

    if (currentLessonData.next_lesson) {
      await loadLesson(currentLessonData.next_lesson.id);
    }
  };

  const toggleFavorite = async () => {
    if (!courseData || isTogglingFavorite) return;

    setIsTogglingFavorite(true);
    try {
      let success;

      if (isFavorite) {
        success = await CourseViewer.removeFromFavorites(courseId);
      } else {
        success = await CourseViewer.addToFavorites(courseId);
      }

      if (success) {
        setIsFavorite(!isFavorite);
        toast(isFavorite ? "Removed from favorites" : "Added to favorites", {
          description: isFavorite
            ? "Course removed from your favorites"
            : "Course added to your favorites",
        });

        setCourseData({
          ...courseData,
          user_data: {
            ...courseData.user_data,
            is_favorite: !isFavorite,
          },
        });
      }
    } catch (error: any) {
      console.error("Failed to toggle favorite status:", error);
      toast("Error", {
        description: error.message || "Failed to update favorite status",
      });
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  if (isLoading || !courseData) {
    return (
      <div className="container mx-auto py-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-medium">Loading course...</h2>
        </div>
      </div>
    );
  }

  const allLessons = courseData.sections.flatMap(
    (section: any) => section.lessons
  );

  const currentLesson = currentLessonData;

  const isUserAllowedToViewContent = courseData.user_data.is_enrolled;

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/courses" className="hover:text-primary">
            Courses
          </Link>
          <span>/</span>
          <span className="text-foreground">{courseData.title}</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {courseData.title}
            </h1>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <span>Instructor: {courseData.instructor.name}</span>
              <span className="mx-2">•</span>
              <span>{courseData.level}</span>
              <span className="mx-2">•</span>
              <span>{courseData.total_lessons} lessons</span>
              <span className="mx-2">•</span>
              <span>{courseData.total_duration}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFavorite}
              disabled={isTogglingFavorite}
            >
              {isTogglingFavorite ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isFavorite ? (
                <HeartOff className="mr-2 h-4 w-4" />
              ) : (
                <Heart className="mr-2 h-4 w-4" />
              )}
              {isFavorite ? "Remove Favorite" : "Add to Favorites"}
            </Button>

            {!courseData.user_data.is_enrolled &&
              !courseData.user_data.application_status && (
                <Button
                  size="sm"
                  onClick={() => setApplicationDialogOpen(true)}
                >
                  Apply Now
                </Button>
              )}
            {courseData.user_data.application_status && (
              <Button size="sm" disabled variant="secondary">
                Application {courseData.user_data.application_status}
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Course Progress</span>
            <span>
              {courseData.user_data?.progress?.percent_complete !== undefined
                ? `${Math.round(
                    courseData.user_data.progress.percent_complete
                  )}%`
                : courseData.user_data?.progress_percentage !== undefined
                ? `${Math.round(courseData.user_data.progress_percentage)}%`
                : "0%"}
            </span>
          </div>
          <Progress
            value={
              courseData.user_data?.progress?.percent_complete ||
              courseData.user_data?.progress_percentage ||
              0
            }
            className="h-2"
          />
          {/* Download Certificate Button */}
          {(courseData.user_data?.progress?.percent_complete === 100 ||
            courseData.user_data?.progress_percentage === 100) && (
            <div className="flex justify-end mt-2">
              <Button
                variant="default"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => router.push("/dashboard/candidate/certificates")}
              >
                Download Certificate
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {currentLesson ? (
              currentLesson.type === "video" && currentLesson.video_url ? (
                isUserAllowedToViewContent ? (
                  <CourseVideoPlayer
                    videoUrl={currentLesson.video_url}
                    title={currentLesson.title}
                    poster={
                      courseData.thumbnail ||
                      "/placeholder.svg?height=500&width=800"
                    }
                    onComplete={handleVideoComplete}
                    nextLessonId={currentLesson.next_lesson?.id}
                    prevLessonId={currentLesson.prev_lesson?.id}
                    onNext={() => navigateLesson("next")}
                    onPrevious={() => navigateLesson("prev")}
                    isAccessRestricted={
                      currentLesson.access_restricted || false
                    }
                    applicationStatus={courseData.user_data.application_status}
                  />
                ) : (
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                    <div className="text-center p-8">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
                      <h3 className="text-xl font-bold mb-2">
                        {currentLesson.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {courseData.user_data.application_status ? (
                          <>
                            Your application is currently{" "}
                            <span className="font-medium text-primary">
                              {courseData.user_data.application_status}
                            </span>{" "}
                            <br />
                            <span>
                              Do some practice and come back to this lesson
                              later.
                            </span>
                          </>
                        ) : (
                          <>
                            Please apply to this course to access this content.
                          </>
                        )}
                      </p>
                      {courseData.user_data.application_status ===
                        "pending" && (
                        <Button asChild>
                          <Link href={`/challenges/${currentLesson.id}`}>
                            Start Challenge
                          </Link>
                        </Button>
                      )}
                      {!courseData.user_data.application_status && (
                        <Button onClick={() => setApplicationDialogOpen(true)}>
                          Apply Now
                        </Button>
                      )}
                    </div>
                  </div>
                )
              ) : (
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                  <div className="text-center p-8">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="text-xl font-bold mb-2">
                      {currentLesson.title}
                    </h3>
                    {currentLesson.type === "article" ? (
                      <div
                        className="prose max-w-none mt-4"
                        dangerouslySetInnerHTML={{
                          __html: currentLesson.content || "",
                        }}
                      />
                    ) : (
                      <>
                        <p className="text-muted-foreground mb-4">
                          Your application is currently{" "}
                          <span className="font-medium text-primary">
                            {courseData.user_data.application_status}
                          </span>{" "}
                          <br />
                          <span>
                            Do some practice and come back to this lesson later.
                          </span>
                        </p>
                        <Button asChild>
                          <Link href={`/challenges/${currentLesson.id}`}>
                            Start Challenge
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )
            ) : (
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">No lesson selected</h3>
                  <p className="text-muted-foreground mb-4">
                    Please select a lesson from the course content
                  </p>
                </div>
              </div>
            )}

            {/* Lesson Navigation */}
            {currentLesson && isUserAllowedToViewContent && (
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => navigateLesson("prev")}
                  disabled={!currentLesson.prev_lesson}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous Lesson
                </Button>
                <Button
                  onClick={() => navigateLesson("next")}
                  disabled={!currentLesson.next_lesson}
                >
                  Next Lesson
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {currentLesson && (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="discussion">Discussion</TabsTrigger>
                </TabsList>
                <TabsContent
                  value="overview"
                  className="p-4 border rounded-md mt-2"
                >
                  <h2 className="text-xl font-bold mb-2">
                    {currentLesson.title}
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    {currentLesson.content ||
                      `This ${currentLesson.type} will help you understand the key concepts and build practical skills.`}
                  </p>
                  {/* <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <ThumbsUp className="mr-1 h-4 w-4" />
                      <span>Helpful (24)</span>
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="mr-1 h-4 w-4" />
                      <span>Comments (8)</span>
                    </div>
                  </div> */}
                </TabsContent>

                <TabsContent
                  value="discussion"
                  className="p-4 border rounded-md mt-2"
                >
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">
                      Discussion ({commentsData?.comments?.length || 0})
                    </h3>

                    {commentsData?.comments?.length > 0 ? (
                      <div className="space-y-6">
                        {commentsData.comments.map(
                          (comment: any, index: number) => (
                            <Card
                              key={comment.id || index}
                              className="overflow-hidden shadow-md border border-muted-foreground/20"
                            >
                              <CardContent className="p-6">
                                <div className="flex items-start gap-5">
                                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-muted flex items-center justify-center font-bold text-xl text-primary border-2 border-primary/30">
                                    {comment.first_name?.[0] ||
                                      comment.username?.[0] ||
                                      "?"}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-semibold text-lg">
                                      {comment.first_name} {comment.last_name}
                                      <span className="ml-2 text-xs text-muted-foreground font-normal">
                                        {comment.username}
                                      </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground mb-2">
                                      {new Date(
                                        comment.timestamp
                                      ).toLocaleString()}
                                    </div>
                                    <div className="mb-3 text-base text-foreground/90 leading-relaxed">
                                      {comment.content}
                                    </div>
                                    {/* Render replies if any */}
                                    {comment.replies &&
                                      comment.replies.length > 0 && (
                                        <div className="mt-5 space-y-3 pl-8 border-l-4 border-accent/40 bg-accent/10 rounded-md py-3">
                                          {comment.replies.map((reply: any) => (
                                            <div
                                              key={reply.id}
                                              className="flex gap-3 items-start"
                                            >
                                              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-accent flex items-center justify-center font-bold text-base text-accent-foreground border border-accent/40">
                                                {reply.staff_name?.[0] || "S"}
                                              </div>
                                              <div>
                                                <div className="font-medium text-base text-accent-foreground">
                                                  {reply.staff_name}
                                                </div>
                                                <div className="text-xs text-muted-foreground mb-1">
                                                  {new Date(
                                                    reply.timestamp
                                                  ).toLocaleString()}
                                                </div>
                                                <div className="text-foreground text-sm leading-relaxed">
                                                  {reply.content}
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-muted/30 rounded-lg">
                        <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">
                          No comments yet. Be the first to share your thoughts!
                        </p>
                      </div>
                    )}

                    <Card className="mt-6">
                      <CardContent className="p-4">
                        <h4 className="text-sm font-medium mb-3">
                          Add a comment
                        </h4>
                        <textarea
                          className="w-full p-3 border rounded-lg text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/50"
                          value={commentContent}
                          onChange={(e) => setCommentContent(e.target.value)}
                          placeholder="Share your thoughts or questions..."
                        ></textarea>
                        <div className="flex justify-end mt-3">
                          <Button
                            size="sm"
                            className="px-4"
                            disabled={
                              commentContent.trim() === "" ||
                              isCreatingDiscussion
                            }
                            onClick={() => {
                              if (
                                commentContent.trim() === "" ||
                                isCreatingDiscussion
                              )
                                return;
                              createDiscussion(commentContent);
                            }}
                          >
                            {isCreatingDiscussion && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Post Comment
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Course Content</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center"
                  >
                    <List className="h-4 w-4 mr-1" />
                    <span className="text-xs">Collapse All</span>
                  </Button>
                </div>
                <div className="space-y-4">
                  {courseData.sections.map((section: any) => (
                    <div key={section.id}>
                      <h4 className="font-medium mb-2">{section.title}</h4>
                      <ul className="space-y-1">
                        {section.lessons.map((lesson: any) => (
                          <li
                            key={lesson.id}
                            className={`flex items-center p-2 rounded-md text-sm ${
                              currentLesson?.id === lesson.id
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted cursor-pointer"
                            }`}
                          >
                            <Checkbox
                              id={`lesson-${lesson.id}`}
                              checked={completedLessons.includes(lesson.id)}
                              onCheckedChange={() =>
                                toggleLessonCompletion(
                                  lesson.id,
                                  !completedLessons.includes(lesson.id)
                                )
                              }
                              className="mr-2"
                              disabled={!courseData.user_data.is_enrolled}
                            />
                            <button
                              className="flex-1 text-left flex items-center"
                              onClick={() => loadLesson(lesson.id)}
                              disabled={!courseData.user_data.is_enrolled}
                            >
                              <span className="truncate">{lesson.title}</span>
                              {lesson.type === "challenge" && (
                                <Badge variant="outline" className="ml-2">
                                  Challenge
                                </Badge>
                              )}
                            </button>
                            <span className="text-xs text-muted-foreground ml-2">
                              {lesson.duration}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {courseData.requirements?.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-lg font-medium mb-3">Requirements</h3>
                  <ul className="space-y-2 ml-5 list-disc text-sm text-muted-foreground">
                    {courseData.requirements.map((req: any) => (
                      <li key={req.id}>{req.text}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {courseData.objectives?.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-lg font-medium mb-3">
                    What You'll Learn
                  </h3>
                  <ul className="space-y-2 ml-5 list-disc text-sm text-muted-foreground">
                    {courseData.objectives.map((obj: any) => (
                      <li key={obj.id}>{obj.text}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <ApplicationDialog
        open={applicationDialogOpen}
        setOpen={setApplicationDialogOpen}
        courseId={parseInt(courseId)}
        courseTitle={courseData.title}
        setRefetchApi={setRefetchApi}
      />
    </div>
  );
}
