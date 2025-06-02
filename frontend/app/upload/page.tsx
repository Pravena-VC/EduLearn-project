"use client";

import type React from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Code,
  FileText,
  Plus,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UploadCoursePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courseDetails, setCourseDetails] = useState({
    title: "",
    description: "",
    category: "",
    level: "",
    price: "",
    thumbnail: null as File | null,
    isPublic: true,
  });
  const [sections, setSections] = useState([
    {
      title: "Section 1",
      description: "",
      lessons: [
        {
          title: "Lesson 1",
          type: "video",
          content: "",
          duration: "",
          file: null as File | null,
        },
      ],
    },
  ]);

  // Handle course details change
  const handleDetailsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCourseDetails({
      ...courseDetails,
      [name]: value,
    });
  };

  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setCourseDetails({
      ...courseDetails,
      [name]: value,
    });
  };

  // Handle switch change
  const handleSwitchChange = (name: string, checked: boolean) => {
    setCourseDetails({
      ...courseDetails,
      [name]: checked,
    });
  };

  // Handle thumbnail upload
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCourseDetails({
        ...courseDetails,
        thumbnail: e.target.files[0],
      });
    }
  };

  // Handle section change
  const handleSectionChange = (index: number, field: string, value: string) => {
    const updatedSections = [...sections];
    updatedSections[index] = {
      ...updatedSections[index],
      [field]: value,
    };
    setSections(updatedSections);
  };

  // Handle lesson change
  const handleLessonChange = (
    sectionIndex: number,
    lessonIndex: number,
    field: string,
    value: string
  ) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].lessons[lessonIndex] = {
      ...updatedSections[sectionIndex].lessons[lessonIndex],
      [field]: value,
    };
    setSections(updatedSections);
  };

  // Handle lesson type change
  const handleLessonTypeChange = (
    sectionIndex: number,
    lessonIndex: number,
    value: string
  ) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].lessons[lessonIndex] = {
      ...updatedSections[sectionIndex].lessons[lessonIndex],
      type: value,
    };
    setSections(updatedSections);
  };

  // Handle lesson file upload
  const handleLessonFileUpload = (
    sectionIndex: number,
    lessonIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const updatedSections = [...sections];
      updatedSections[sectionIndex].lessons[lessonIndex] = {
        ...updatedSections[sectionIndex].lessons[lessonIndex],
        file: e.target.files[0],
      };
      setSections(updatedSections);
    }
  };

  // Add new section
  const addSection = () => {
    setSections([
      ...sections,
      {
        title: `Section ${sections.length + 1}`,
        description: "",
        lessons: [
          {
            title: "Lesson 1",
            type: "video",
            content: "",
            duration: "",
            file: null,
          },
        ],
      },
    ]);
  };

  // Remove section
  const removeSection = (index: number) => {
    if (sections.length > 1) {
      const updatedSections = [...sections];
      updatedSections.splice(index, 1);
      setSections(updatedSections);
    }
  };

  // Add new lesson to section
  const addLesson = (sectionIndex: number) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].lessons.push({
      title: `Lesson ${updatedSections[sectionIndex].lessons.length + 1}`,
      type: "video",
      content: "",
      duration: "",
      file: null,
    });
    setSections(updatedSections);
  };

  // Remove lesson from section
  const removeLesson = (sectionIndex: number, lessonIndex: number) => {
    if (sections[sectionIndex].lessons.length > 1) {
      const updatedSections = [...sections];
      updatedSections[sectionIndex].lessons.splice(lessonIndex, 1);
      setSections(updatedSections);
    }
  };

  // Move section up
  const moveSectionUp = (index: number) => {
    if (index > 0) {
      const updatedSections = [...sections];
      const temp = updatedSections[index];
      updatedSections[index] = updatedSections[index - 1];
      updatedSections[index - 1] = temp;
      setSections(updatedSections);
    }
  };

  // Move section down
  const moveSectionDown = (index: number) => {
    if (index < sections.length - 1) {
      const updatedSections = [...sections];
      const temp = updatedSections[index];
      updatedSections[index] = updatedSections[index + 1];
      updatedSections[index + 1] = temp;
      setSections(updatedSections);
    }
  };

  // Move lesson up
  const moveLessonUp = (sectionIndex: number, lessonIndex: number) => {
    if (lessonIndex > 0) {
      const updatedSections = [...sections];
      const temp = updatedSections[sectionIndex].lessons[lessonIndex];
      updatedSections[sectionIndex].lessons[lessonIndex] =
        updatedSections[sectionIndex].lessons[lessonIndex - 1];
      updatedSections[sectionIndex].lessons[lessonIndex - 1] = temp;
      setSections(updatedSections);
    }
  };

  // Move lesson down
  const moveLessonDown = (sectionIndex: number, lessonIndex: number) => {
    if (lessonIndex < sections[sectionIndex].lessons.length - 1) {
      const updatedSections = [...sections];
      const temp = updatedSections[sectionIndex].lessons[lessonIndex];
      updatedSections[sectionIndex].lessons[lessonIndex] =
        updatedSections[sectionIndex].lessons[lessonIndex + 1];
      updatedSections[sectionIndex].lessons[lessonIndex + 1] = temp;
      setSections(updatedSections);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error submitting course:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      courseDetails.title.trim() !== "" &&
      courseDetails.description.trim() !== "" &&
      courseDetails.category !== "" &&
      courseDetails.level !== ""
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Upload Course</h1>
            <p className="text-muted-foreground">
              Create and publish your course content
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid() || isSubmitting}
            >
              {isSubmitting ? "Publishing..." : "Publish Course"}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Course Details</TabsTrigger>
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Course Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Provide the basic details about your course
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g., Complete Web Development Bootcamp"
                    value={courseDetails.title}
                    onChange={handleDetailsChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Course Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe what students will learn in this course"
                    rows={5}
                    value={courseDetails.description}
                    onChange={handleDetailsChange}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={courseDetails.category}
                      onValueChange={(value) =>
                        handleSelectChange("category", value)
                      }
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="web-development">
                          Web Development
                        </SelectItem>
                        <SelectItem value="programming">Programming</SelectItem>
                        <SelectItem value="data-science">
                          Data Science
                        </SelectItem>
                        <SelectItem value="mobile-development">
                          Mobile Development
                        </SelectItem>
                        <SelectItem value="devops">DevOps</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="level">Level</Label>
                    <Select
                      value={courseDetails.level}
                      onValueChange={(value) =>
                        handleSelectChange("level", value)
                      }
                    >
                      <SelectTrigger id="level">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">
                          Intermediate
                        </SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="all-levels">All Levels</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    placeholder="e.g., 49.99"
                    value={courseDetails.price}
                    onChange={handleDetailsChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thumbnail">Course Thumbnail</Label>
                  <div className="flex items-center gap-4">
                    {courseDetails.thumbnail ? (
                      <div className="relative w-32 h-24 rounded-md overflow-hidden">
                        <img
                          src={
                            URL.createObjectURL(courseDetails.thumbnail) ||
                            "/placeholder.svg"
                          }
                          alt="Course thumbnail"
                          className="object-cover w-full h-full"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() =>
                            setCourseDetails({
                              ...courseDetails,
                              thumbnail: null,
                            })
                          }
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-32 h-24 border-2 border-dashed rounded-md flex items-center justify-center bg-muted">
                        <span className="text-xs text-muted-foreground">
                          No image
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <Input
                        id="thumbnail"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleThumbnailUpload}
                      />
                      <Label
                        htmlFor="thumbnail"
                        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 cursor-pointer"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Thumbnail
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Recommended size: 1280x720px (16:9 ratio)
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                >
                  Cancel
                </Button>
                <Button onClick={() => setActiveTab("curriculum")}>
                  Continue to Curriculum
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Curriculum Tab */}
          <TabsContent value="curriculum" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Curriculum</CardTitle>
                <CardDescription>
                  Organize your course into sections and lessons
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {sections.map((section, sectionIndex) => (
                  <div
                    key={sectionIndex}
                    className="border rounded-md p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Input
                          placeholder="Section Title"
                          value={section.title}
                          onChange={(e) =>
                            handleSectionChange(
                              sectionIndex,
                              "title",
                              e.target.value
                            )
                          }
                          className="text-lg font-medium"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveSectionUp(sectionIndex)}
                          disabled={sectionIndex === 0}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveSectionDown(sectionIndex)}
                          disabled={sectionIndex === sections.length - 1}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSection(sectionIndex)}
                          disabled={sections.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      placeholder="Section Description"
                      value={section.description}
                      onChange={(e) =>
                        handleSectionChange(
                          sectionIndex,
                          "description",
                          e.target.value
                        )
                      }
                      rows={2}
                    />
                    <Separator />
                    <div className="space-y-4">
                      {section.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lessonIndex}
                          className="border rounded-md p-4 space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <Input
                                placeholder="Lesson Title"
                                value={lesson.title}
                                onChange={(e) =>
                                  handleLessonChange(
                                    sectionIndex,
                                    lessonIndex,
                                    "title",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  moveLessonUp(sectionIndex, lessonIndex)
                                }
                                disabled={lessonIndex === 0}
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  moveLessonDown(sectionIndex, lessonIndex)
                                }
                                disabled={
                                  lessonIndex === section.lessons.length - 1
                                }
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  removeLesson(sectionIndex, lessonIndex)
                                }
                                disabled={section.lessons.length === 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Lesson Type</Label>
                              <Select
                                value={lesson.type}
                                onValueChange={(value) =>
                                  handleLessonTypeChange(
                                    sectionIndex,
                                    lessonIndex,
                                    value
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="video">
                                    <div className="flex items-center">
                                      <Video className="mr-2 h-4 w-4" />
                                      <span>Video</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="text">
                                    <div className="flex items-center">
                                      <FileText className="mr-2 h-4 w-4" />
                                      <span>Text</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="challenge">
                                    <div className="flex items-center">
                                      <Code className="mr-2 h-4 w-4" />
                                      <span>Challenge</span>
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Duration (minutes)</Label>
                              <Input
                                type="number"
                                placeholder="e.g., 15"
                                value={lesson.duration}
                                onChange={(e) =>
                                  handleLessonChange(
                                    sectionIndex,
                                    lessonIndex,
                                    "duration",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                          {lesson.type === "video" && (
                            <div className="space-y-2">
                              <Label>Video File</Label>
                              <div className="flex items-center gap-4">
                                {lesson.file ? (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>{lesson.file.name}</span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => {
                                        const updatedSections = [...sections];
                                        updatedSections[sectionIndex].lessons[
                                          lessonIndex
                                        ].file = null;
                                        setSections(updatedSections);
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex-1">
                                    <Input
                                      id={`file-${sectionIndex}-${lessonIndex}`}
                                      type="file"
                                      accept="video/*"
                                      className="hidden"
                                      onChange={(e) =>
                                        handleLessonFileUpload(
                                          sectionIndex,
                                          lessonIndex,
                                          e
                                        )
                                      }
                                    />
                                    <Label
                                      htmlFor={`file-${sectionIndex}-${lessonIndex}`}
                                      className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 cursor-pointer"
                                    >
                                      <Upload className="mr-2 h-4 w-4" />
                                      Upload Video
                                    </Label>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          {lesson.type === "text" && (
                            <div className="space-y-2">
                              <Label>Content</Label>
                              <Textarea
                                placeholder="Enter lesson content"
                                value={lesson.content}
                                onChange={(e) =>
                                  handleLessonChange(
                                    sectionIndex,
                                    lessonIndex,
                                    "content",
                                    e.target.value
                                  )
                                }
                                rows={5}
                              />
                            </div>
                          )}
                          {lesson.type === "challenge" && (
                            <div className="space-y-2">
                              <Label>Challenge Description</Label>
                              <Textarea
                                placeholder="Describe the challenge"
                                value={lesson.content}
                                onChange={(e) =>
                                  handleLessonChange(
                                    sectionIndex,
                                    lessonIndex,
                                    "content",
                                    e.target.value
                                  )
                                }
                                rows={5}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => addLesson(sectionIndex)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Lesson
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={addSection}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Section
                </Button>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("details")}
                >
                  Back to Details
                </Button>
                <Button onClick={() => setActiveTab("settings")}>
                  Continue to Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Settings</CardTitle>
                <CardDescription>
                  Configure additional settings for your course
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="public">Public Course</Label>
                    <p className="text-sm text-muted-foreground">
                      Make this course visible to all users
                    </p>
                  </div>
                  <Switch
                    id="public"
                    checked={courseDetails.isPublic}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("isPublic", checked)
                    }
                  />
                </div>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Course Preview</h3>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Preview Mode</AlertTitle>
                    <AlertDescription>
                      You can preview how your course will appear to students
                      before publishing.
                    </AlertDescription>
                  </Alert>
                  <Button variant="outline" className="w-full">
                    Preview Course
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("curriculum")}
                >
                  Back to Curriculum
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!isFormValid() || isSubmitting}
                >
                  {isSubmitting ? "Publishing..." : "Publish Course"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
