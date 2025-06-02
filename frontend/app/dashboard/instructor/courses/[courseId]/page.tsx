"use client";

import InstructorHeader from "@/components/Instructor-Header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { _axios } from "@/lib/axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Clock,
  FileText,
  GripVertical,
  MoreVertical,
  Plus,
  Save,
  Trash,
  Upload,
  UploadCloud,
  Users2,
  Video,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function InstructorCourseManagementPage() {
  const params = useParams();
  const router = useRouter();
  const { courseId } = params;
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");

  // State variables for file uploads
  const [videoFiles, setVideoFiles] = useState<{ [key: string]: File }>({});
  const [videoPreviews, setVideoPreviews] = useState<{ [key: string]: string }>(
    {}
  );
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<{
    sectionIndex: number;
    lessonIndex: number;
    lessonId: string;
  } | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  const [courseDetails, setCourseDetails] = useState({
    id: "",
    title: "",
    description: "",
    category: "",
    level: "",
    price: 0,
    image: "",
    published: false,
    featured: false,
    requirements: [] as string[],
    objectives: [] as string[],
    tags: [] as string[],
    sections: [] as any[],
  });

  const { mutate: uploadCourseMutation, isPending: isUploading } = useMutation({
    mutationFn: async (courseData: any) => {
      const formData = new FormData();

      formData.append("title", courseData.title);
      formData.append("description", courseData.description || "");
      formData.append("price", "0");
      formData.append("level", courseData.level || "Beginner");
      formData.append("category", courseData.category || "");
      formData.append(
        "is_published",
        courseData.is_published ? "true" : "false"
      );
      formData.append("is_featured", courseData.is_featured ? "true" : "false");

      if (courseData.requirements && courseData.requirements.length > 0) {
        formData.append(
          "requirements",
          JSON.stringify(courseData.requirements)
        );
      }

      formData.append("resources", JSON.stringify([]));

      if (courseData.objectives && courseData.objectives.length > 0) {
        formData.append("objectives", JSON.stringify(courseData.objectives));
      }

      if (courseData.sections && courseData.sections.length > 0) {
        formData.append("sections", JSON.stringify(courseData.sections));
      }

      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
      }

      Object.entries(videoFiles).forEach(([lessonId, file]) => {
        formData.append(`video_${lessonId}`, file);
      });

      const res = await _axios({
        method: "post",
        url: "/courses/",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data;
    },
    onSuccess(data) {
      toast.success("Course saved successfully", {
        description:
          courseId === "new"
            ? "Your new course has been created."
            : "Your course changes have been saved.",
        duration: 5000,
      });

      if (courseId === "new" && data?.data?.id) {
        router.push(`/dashboard/instructor/courses`);
      }
    },
    onError(error: any) {
      toast.error(error?.response?.data?.message || "Failed to save course", {
        description: "Please check your input and try again.",
        duration: 5000,
      });
      console.error("Error saving course:", error);
    },
  });

  const { mutate: uploadThumbnailMutation, isPending: isUploadingThumbnail } =
    useMutation({
      mutationFn: async (file: File) => {
        const formData = new FormData();
        formData.append("thumbnail", file);

        const res = await _axios.post(
          `/courses/${courseId}/thumbnail/`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        return res.data;
      },
      onSuccess() {
        toast.success("Thumbnail uploaded successfully");
      },
      onError(error: any) {
        toast.error(
          error?.response?.data?.message || "Failed to upload thumbnail"
        );
      },
    });

  const { mutate: uploadVideoMutation, isPending: isUploadingVideo } =
    useMutation({
      mutationFn: async ({
        file,
        lessonId,
        sectionId,
        duration,
      }: {
        file: File;
        lessonId: string;
        sectionId: string;
        duration?: string;
      }) => {
        const formData = new FormData();
        formData.append("video", file);

        if (duration) {
          formData.append("duration", duration);
        }

        const res = await _axios.post(
          `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/video/`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        return res.data;
      },
      onSuccess() {
        toast.success("Video uploaded successfully");
        setShowVideoModal(false);
      },
      onError(error: any) {
        toast.error(error?.response?.data?.message || "Failed to upload video");
      },
    });

  const { data: courseData, isLoading: isFetchingCourse } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      if (courseId === "new") return null;

      const res = await _axios.get(`/courses/${courseId}/`);
      return res.data;
    },
    enabled: courseId !== "new",
  });

  const [courseStats, setCourseStats] = useState({
    students: 0,
    revenue: 0,
    rating: 0,
    reviews: 0,
    completionRate: 0,
    avgProgress: 0,
  });

  const processVideoUrls = (sections: any) => {
    if (!sections) return [];

    return sections.map((section: any) => ({
      ...section,
      lessons: section.lessons.map((lesson: any) => ({
        ...lesson,
        videoUrl: lesson.video_url || "",
      })),
    }));
  };

  useEffect(() => {
    if (courseData && !isLoading) {
      const formattedData = courseData.data || {};
      setCourseDetails({
        id: formattedData.id || "",
        title: formattedData.title || "New Course",
        description: formattedData.description || "",
        category: formattedData.category || "",
        level: formattedData.level || "Beginner",
        price: formattedData.price || 0,
        image:
          formattedData.thumbnail || "/placeholder.svg?height=400&width=600",
        published: formattedData.is_published || false,
        featured: formattedData.is_featured || false,
        requirements: formattedData.requirements?.map(
          (req: any) => req.text
        ) || [""],
        objectives: formattedData.objectives?.map((obj: any) => obj.text) || [
          "",
        ],
        tags: [],
        sections: processVideoUrls(formattedData.sections) || [
          {
            id: "section-1",
            title: "Introduction",
            lessons: [
              {
                id: "lesson-1",
                title: "Welcome to the Course",
                type: "video",
                duration: "00:00",
                content: "",
                videoUrl: "",
                isPublished: false,
              },
            ],
          },
        ],
      });

      if (formattedData.total_students) {
        setCourseStats({
          students: formattedData.total_students || 0,
          revenue: 0,
          rating: formattedData.rating || 0,
          reviews: formattedData.reviews_count || 0,
          completionRate: formattedData.completion_rate || 0,
          avgProgress: formattedData.avg_progress || 0,
        });
      }

      setIsLoading(false);
    } else if (courseId === "new" && isLoading) {
      setTimeout(() => {
        setCourseDetails({
          id: "",
          title: "New Course",
          description: "",
          category: "",
          level: "Beginner",
          price: 0,
          image: "/placeholder.svg?height=400&width=600",
          published: false,
          featured: false,
          requirements: [""],
          objectives: [""],
          tags: [],
          sections: [
            {
              id: "section-1",
              title: "Introduction",
              lessons: [
                {
                  id: "lesson-1",
                  title: "Welcome to the Course",
                  type: "video",
                  duration: "00:00",
                  content: "",
                  videoUrl: "",
                  isPublished: false,
                },
              ],
            },
          ],
        });
        setIsLoading(false);
      }, 500);
    }
  }, [courseData, courseId, isLoading]);

  const handleSave = async () => {
    const courseData = {
      title: courseDetails.title,
      description: courseDetails.description,
      price: 0,
      level: courseDetails.level,
      category: courseDetails.category,
      is_published: courseDetails.published,
      is_featured: courseDetails.featured,
      requirements: courseDetails.requirements.filter(
        (req) => req.trim() !== ""
      ),
      objectives: courseDetails.objectives.filter((obj) => obj.trim() !== ""),
      sections: courseDetails.sections.map((section) => ({
        id: section.id,
        title: section.title,
        order: courseDetails.sections.indexOf(section),
        lessons: section.lessons.map((lesson: any) => ({
          id: lesson.id,
          title: lesson.title,
          type: lesson.type || "video",
          content: lesson.content || "",
          is_published: lesson.isPublished || false,
          order: section.lessons.indexOf(lesson),
          duration: lesson.duration || "00:00",
        })),
      })),
    };

    if (!courseData?.category) {
      toast.error("Please select a category for the course");
      return;
    }

    if (courseData?.requirements.length === 0) {
      toast.error("Please add at least one requirement for the course");
      return;
    }

    if (courseData?.objectives.length === 0) {
      toast.error("Please add at least one objective for the course");
      return;
    }

    if (!courseData?.description) {
      toast.error("Please select a description for the course");
      return;
    }

    if (!thumbnailFile) {
      toast.error("Please upload a thumbnail for the course");
      return;
    }

    uploadCourseMutation(courseData);
  };

  const handlePublishToggle = () => {
    setCourseDetails({
      ...courseDetails,
      published: !courseDetails.published,
    });
  };

  const addNewRequirement = () => {
    setCourseDetails({
      ...courseDetails,
      requirements: [...courseDetails.requirements, ""],
    });
  };

  const updateRequirement = (index: number, value: string) => {
    const updatedRequirements = [...courseDetails.requirements];
    updatedRequirements[index] = value;
    setCourseDetails({
      ...courseDetails,
      requirements: updatedRequirements,
    });
  };

  const removeRequirement = (index: number) => {
    const updatedRequirements = [...courseDetails.requirements];
    updatedRequirements.splice(index, 1);
    setCourseDetails({
      ...courseDetails,
      requirements: updatedRequirements,
    });
  };

  const addNewObjective = () => {
    setCourseDetails({
      ...courseDetails,
      objectives: [...courseDetails.objectives, ""],
    });
  };

  const updateObjective = (index: number, value: string) => {
    const updatedObjectives = [...courseDetails.objectives];
    updatedObjectives[index] = value;
    setCourseDetails({
      ...courseDetails,
      objectives: updatedObjectives,
    });
  };

  const removeObjective = (index: number) => {
    const updatedObjectives = [...courseDetails.objectives];
    updatedObjectives.splice(index, 1);
    setCourseDetails({
      ...courseDetails,
      objectives: updatedObjectives,
    });
  };

  const addNewSection = () => {
    const newSection = {
      id: `section-${courseDetails.sections.length + 1}`,
      title: `New Section`,
      lessons: [],
    };

    setCourseDetails({
      ...courseDetails,
      sections: [...courseDetails.sections, newSection],
    });
  };

  const addNewLesson = (sectionId: string) => {
    const updatedSections = courseDetails.sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          lessons: [
            ...section.lessons,
            {
              id: `lesson-${Date.now()}`,
              title: "New Lesson",
              type: "video",
              duration: "00:00",
              content: "",
              videoUrl: "",
              isPublished: false,
            },
          ],
        };
      }
      return section;
    });

    setCourseDetails({
      ...courseDetails,
      sections: updatedSections,
    });
  };

  const handleVideoUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    sectionIndex: number,
    lessonIndex: number
  ) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      const lesson = courseDetails.sections[sectionIndex].lessons[lessonIndex];
      const videoUrl = URL.createObjectURL(file);

      // Store the video file and preview
      setVideoFiles((prev) => ({ ...prev, [lesson.id]: file }));
      setVideoPreviews((prev) => ({ ...prev, [lesson.id]: videoUrl }));

      // Calculate video duration
      const videoElement = document.createElement("video");
      videoElement.preload = "metadata";
      videoElement.src = videoUrl;

      videoElement.onloadedmetadata = () => {
        const duration = videoElement.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        const formattedDuration = `${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

        const updatedSections = [...courseDetails.sections];
        updatedSections[sectionIndex].lessons[lessonIndex].duration =
          formattedDuration;
        updatedSections[sectionIndex].lessons[lessonIndex].videoUrl = videoUrl;
        setCourseDetails({
          ...courseDetails,
          sections: updatedSections,
        });
      };
    } else {
      alert("Please upload a valid video file.");
    }
  };

  const handleThumbnailUpload = (event: any) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const thumbnailUrl = URL.createObjectURL(file);
      setThumbnailFile(file);
      setThumbnailPreview(thumbnailUrl);
      setCourseDetails({
        ...courseDetails,
        image: thumbnailUrl,
      });
    } else {
      alert("Please upload a valid image file.");
    }
  };

  const openVideoUploadModal = (sectionIndex: number, lessonIndex: number) => {
    setSelectedLesson({
      sectionIndex,
      lessonIndex,
      lessonId: courseDetails.sections[sectionIndex].lessons[lessonIndex].id,
    });
    setShowVideoModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading course details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mx-6">
      <InstructorHeader />

      <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:space-y-0">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/dashboard/instructor">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Instructor Dashboard
            </Link>
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">
            {courseId === "new" ? "Create New Course" : "Edit Course"}
          </h1>
          <p className="text-muted-foreground">
            {courseId === "new"
              ? "Create and publish a new course for your students"
              : "Update your course content and settings"}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="default" onClick={handleSave} disabled={isUploading}>
            {isUploading ? (
              <>
                <div className="h-4 w-4 border-t-2 border-b-2 border-background animate-spin rounded-full mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="details"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Course Curriculum</CardTitle>
              <CardDescription>
                Organize your course content into sections and lessons
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {courseDetails.sections.map((section, sectionIndex) => (
                <div key={section.id} className="border rounded-lg">
                  <div className="flex items-center justify-between p-4 bg-muted/30">
                    <div className="flex items-center">
                      <GripVertical className="h-5 w-5 text-muted-foreground mr-2" />
                      <div>
                        <Input
                          value={section.title}
                          onChange={(e) => {
                            const updatedSections = [...courseDetails.sections];
                            updatedSections[sectionIndex].title =
                              e.target.value;
                            setCourseDetails({
                              ...courseDetails,
                              sections: updatedSections,
                            });
                          }}
                          className="border-0 bg-transparent p-0 px-4 text-base font-medium focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const updatedSections = courseDetails.sections.filter(
                            (s) => s.id !== section.id
                          );
                          setCourseDetails({
                            ...courseDetails,
                            sections: updatedSections,
                          });
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    {section.lessons.map((lesson: any, lessonIndex: number) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between border rounded-md p-2"
                      >
                        <div className="flex items-center flex-1 mx-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground mr-2" />
                          {lesson.type === "video" ? (
                            <Video className="h-4 w-4 mr-2 text-muted-foreground" />
                          ) : (
                            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                          )}
                          <Input
                            value={lesson.title}
                            onChange={(e) => {
                              const updatedSections = [
                                ...courseDetails.sections,
                              ];
                              updatedSections[sectionIndex].lessons[
                                lessonIndex
                              ].title = e.target.value;
                              setCourseDetails({
                                ...courseDetails,
                                sections: updatedSections,
                              });
                            }}
                            className="border-0 bg-transparent p-0 px-4 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground">
                            {lesson.duration}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Switch
                              checked={lesson.isPublished}
                              onCheckedChange={(checked) => {
                                const updatedSections = [
                                  ...courseDetails.sections,
                                ];
                                updatedSections[sectionIndex].lessons[
                                  lessonIndex
                                ].isPublished = checked;
                                setCourseDetails({
                                  ...courseDetails,
                                  sections: updatedSections,
                                });
                              }}
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              openVideoUploadModal(sectionIndex, lessonIndex)
                            }
                          >
                            <UploadCloud className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const updatedSections = [
                                ...courseDetails.sections,
                              ];
                              updatedSections[sectionIndex].lessons.splice(
                                lessonIndex,
                                1
                              );
                              setCourseDetails({
                                ...courseDetails,
                                sections: updatedSections,
                              });
                            }}
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2 border border-dashed"
                      onClick={() => addNewLesson(section.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Lesson
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                className="w-full"
                onClick={addNewSection}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Section
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Course Details</CardTitle>
              <CardDescription>
                Provide the basic information about your course
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={courseDetails.title}
                  onChange={(e) =>
                    setCourseDetails({
                      ...courseDetails,
                      title: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={6}
                  value={courseDetails.description}
                  onChange={(e) =>
                    setCourseDetails({
                      ...courseDetails,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={courseDetails.category}
                    onValueChange={(value) =>
                      setCourseDetails({
                        ...courseDetails,
                        category: value,
                      })
                    }
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Web Development">
                        Web Development
                      </SelectItem>
                      <SelectItem value="Data Science">Data Science</SelectItem>
                      <SelectItem value="Mobile Development">
                        Mobile Development
                      </SelectItem>
                      <SelectItem value="Programming">Programming</SelectItem>
                      <SelectItem value="DevOps">DevOps</SelectItem>
                      <SelectItem value="Databases">Databases</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select
                    value={courseDetails.level}
                    onValueChange={(value) =>
                      setCourseDetails({
                        ...courseDetails,
                        level: value,
                      })
                    }
                  >
                    <SelectTrigger id="level">
                      <SelectValue placeholder="Select a level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="All Levels">All Levels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Course Image</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="border rounded-lg overflow-hidden aspect-video bg-muted/20 flex items-center justify-center relative">
                      {thumbnailPreview || courseDetails.image ? (
                        <img
                          src={
                            thumbnailPreview ||
                            courseDetails.image ||
                            "/placeholder.svg?height=96&width=160"
                          }
                          alt="Course thumbnail"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-6">
                          <div className="rounded-full bg-muted/30 w-12 h-12 flex items-center justify-center mx-auto mb-2">
                            <Upload className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-medium mb-1">
                            Upload Thumbnail
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Recommended: 1280x720px
                          </p>
                        </div>
                      )}

                      {thumbnailPreview && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                          onClick={() => {
                            setThumbnailPreview(null);
                            setThumbnailFile(null);
                            setCourseDetails({
                              ...courseDetails,
                              image:
                                courseId === "new"
                                  ? "/placeholder.svg?height=400&width=600"
                                  : courseDetails.image,
                            });
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="hidden"
                      id="thumbnail-upload"
                    />

                    <Button
                      variant="outline"
                      type="button"
                      className="w-full"
                      onClick={() => {
                        // Programmatically trigger the file input click
                        document.getElementById("thumbnail-upload")?.click();
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {thumbnailPreview
                        ? "Change Thumbnail"
                        : "Upload Thumbnail"}
                    </Button>

                    <p className="text-xs text-muted-foreground">
                      Upload a high-quality image to represent your course.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">
                      Thumbnail Guidelines
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-start">
                        <span className="mr-2 mt-0.5">•</span>
                        <span>
                          Use a 16:9 aspect ratio (1280x720px recommended)
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 mt-0.5">•</span>
                        <span>
                          Keep important elements centered to avoid cropping
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 mt-0.5">•</span>
                        <span>Include clear, readable text if applicable</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 mt-0.5">•</span>
                        <span>
                          Use high-contrast colors for better visibility
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 mt-0.5">•</span>
                        <span>Maximum file size: 2MB</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Requirements Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Course Requirements</Label>
                  <Button variant="ghost" size="sm" onClick={addNewRequirement}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                {courseDetails.requirements.map((requirement, index) => (
                  <div
                    key={`req-${index}`}
                    className="flex items-center space-x-2"
                  >
                    <Textarea
                      value={requirement}
                      onChange={(e) => updateRequirement(index, e.target.value)}
                      placeholder="Enter a requirement"
                      rows={2}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRequirement(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Learning Objectives Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>What Students Will Learn</Label>
                  <Button variant="ghost" size="sm" onClick={addNewObjective}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                {courseDetails.objectives.map((objective, index) => (
                  <div
                    key={`obj-${index}`}
                    className="flex items-center space-x-2"
                  >
                    <Textarea
                      value={objective}
                      onChange={(e) => updateObjective(index, e.target.value)}
                      placeholder="Enter a learning objective"
                      rows={2}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeObjective(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Student Management</CardTitle>
              <CardDescription>
                View and manage students enrolled in your course
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {courseId === "new" ? (
                <div className="text-center py-8">
                  <Users2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-1">No Students Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Students will appear here once your course is published and
                    they enroll
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Total Students
                            </p>
                            <p className="text-2xl font-bold">
                              {courseStats.students.toLocaleString()}
                            </p>
                          </div>
                          <Users2 className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Completion Rate
                            </p>
                            <p className="text-2xl font-bold">
                              {courseStats.completionRate}%
                            </p>
                          </div>
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-lg font-medium text-primary">
                              %
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Average Progress
                            </p>
                            <p className="text-2xl font-bold">
                              {courseStats.avgProgress}%
                            </p>
                          </div>
                          <Clock className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Enrolled On</TableHead>
                          <TableHead>Progress</TableHead>
                          <TableHead>Last Activity</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Sample student data */}
                        {[...Array(5)].map((_, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-1">
                                  <span className="text-xs font-medium text-primary">
                                    {["JD", "AR", "BT", "CL", "MK"][i]}
                                  </span>
                                </div>
                                <div>
                                  {
                                    [
                                      "John Doe",
                                      "Alice Rodriguez",
                                      "Ben Thompson",
                                      "Clara Lee",
                                      "Mark Kim",
                                    ][i]
                                  }
                                  <p className="text-xs text-muted-foreground">
                                    {
                                      [
                                        "john@example.com",
                                        "alice@example.com",
                                        "ben@example.com",
                                        "clara@example.com",
                                        "mark@example.com",
                                      ][i]
                                    }
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {
                                [
                                  "Apr 15, 2025",
                                  "Mar 22, 2025",
                                  "Apr 01, 2025",
                                  "Apr 10, 2025",
                                  "Mar 30, 2025",
                                ][i]
                              }
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Progress
                                  value={[82, 45, 100, 63, 21][i]}
                                  className="h-2 w-20"
                                />
                                <span className="text-sm">
                                  {[82, 45, 100, 63, 21][i]}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {
                                [
                                  "2 hours ago",
                                  "1 day ago",
                                  "Just now",
                                  "3 days ago",
                                  "1 week ago",
                                ][i]
                              }
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Course Settings</CardTitle>
              <CardDescription>
                Manage additional settings for your course
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="certificate">Enable Course Certificate</Label>
                  <p className="text-sm text-muted-foreground">
                    Generate certificates for students who complete this course
                  </p>
                </div>
                <Switch id="certificate" defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-xl text-destructive">
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible actions for your course
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Delete Course</Label>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete this course and all its content
                  </p>
                </div>
                <Button variant="destructive">Delete</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showVideoModal && selectedLesson && (
        <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
          <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden">
            <DialogHeader className="px-6 pt-6 pb-4">
              <DialogTitle>Upload Video</DialogTitle>
              <DialogDescription>
                Upload a video for lesson:{" "}
                <span className="font-medium text-foreground">
                  {
                    courseDetails.sections[selectedLesson.sectionIndex].lessons[
                      selectedLesson.lessonIndex
                    ].title
                  }
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="px-6 py-4 space-y-5">
              {!videoPreviews[selectedLesson.lessonId] ? (
                <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/30">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                    <Video className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-1">Upload your video</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop your video file or click to browse
                  </p>
                  <Input
                    type="file"
                    accept="video/*"
                    id="video-upload-input"
                    className="hidden"
                    onChange={(e) =>
                      handleVideoUpload(
                        e,
                        selectedLesson.sectionIndex,
                        selectedLesson.lessonIndex
                      )
                    }
                  />
                  <label htmlFor="video-upload-input">
                    <Button
                      variant="outline"
                      className="mx-auto cursor-pointer"
                      onClick={() => {
                        document.getElementById("video-upload-input")?.click();
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Select Video
                    </Button>
                  </label>
                  <div className="grid grid-cols-3 gap-2 mt-6 text-xs text-muted-foreground">
                    <div className="text-center p-2">
                      <div className="rounded-full bg-muted/20 w-8 h-8 flex items-center justify-center mx-auto mb-1">
                        <Video className="h-4 w-4" />
                      </div>
                      <p>MP4, WebM, MKV</p>
                    </div>
                    <div className="text-center p-2">
                      <div className="rounded-full bg-muted/20 w-8 h-8 flex items-center justify-center mx-auto mb-1">
                        <span className="text-xs">2GB</span>
                      </div>
                      <p>Max 2GB</p>
                    </div>
                    <div className="text-center p-2">
                      <div className="rounded-full bg-muted/20 w-8 h-8 flex items-center justify-center mx-auto mb-1">
                        <Clock className="h-4 w-4" />
                      </div>
                      <p>Auto Duration</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg overflow-hidden border border-border">
                    <video
                      controls
                      src={videoPreviews[selectedLesson.lessonId]}
                      className="w-full aspect-video"
                    />
                  </div>
                  <div className="flex justify-between items-center bg-muted/30 rounded-md p-3">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">
                        Duration:{" "}
                        <span className="font-medium">
                          {
                            courseDetails.sections[selectedLesson.sectionIndex]
                              .lessons[selectedLesson.lessonIndex].duration
                          }
                        </span>
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                      {videoFiles[selectedLesson.lessonId]?.name}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Reset video
                        const updatedSections = [...courseDetails.sections];
                        updatedSections[selectedLesson.sectionIndex].lessons[
                          selectedLesson.lessonIndex
                        ].duration = "00:00";
                        updatedSections[selectedLesson.sectionIndex].lessons[
                          selectedLesson.lessonIndex
                        ].videoUrl = "";

                        setCourseDetails({
                          ...courseDetails,
                          sections: updatedSections,
                        });

                        // Delete preview and file
                        const newVideoPreviews = { ...videoPreviews };
                        delete newVideoPreviews[selectedLesson.lessonId];
                        setVideoPreviews(newVideoPreviews);

                        const newVideoFiles = { ...videoFiles };
                        delete newVideoFiles[selectedLesson.lessonId];
                        setVideoFiles(newVideoFiles);
                      }}
                    >
                      <Trash className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>

                  <div className="rounded-md border p-3 bg-muted/10">
                    <h4 className="text-sm font-medium mb-2">Video Settings</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="auto-play"
                          className="text-sm cursor-pointer"
                        >
                          Auto-play for students
                        </Label>
                        <Switch id="auto-play" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="download-allowed"
                          className="text-sm cursor-pointer"
                        >
                          Allow students to download
                        </Label>
                        <Switch id="download-allowed" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end items-center gap-2 px-6 py-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowVideoModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const file = videoFiles[selectedLesson.lessonId];
                  if (file && courseId !== "new") {
                    const section =
                      courseDetails.sections[selectedLesson.sectionIndex];
                    const lesson = section.lessons[selectedLesson.lessonIndex];

                    // Upload the video using the React Query mutation
                    uploadVideoMutation({
                      file,
                      lessonId: lesson.id,
                      sectionId: section.id,
                      duration: lesson.duration,
                    });
                  } else {
                    setShowVideoModal(false);
                    toast.info(
                      "Video will be uploaded when you save the course",
                      {
                        duration: 5000,
                      }
                    );
                  }
                }}
                disabled={
                  !videoFiles[selectedLesson.lessonId] || isUploadingVideo
                }
              >
                {isUploadingVideo ? (
                  <>
                    <div className="h-4 w-4 border-t-2 border-b-2 border-background animate-spin rounded-full mr-2"></div>
                    Uploading...
                  </>
                ) : videoFiles[selectedLesson.lessonId] ? (
                  "Save Video"
                ) : (
                  "Upload Video"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
