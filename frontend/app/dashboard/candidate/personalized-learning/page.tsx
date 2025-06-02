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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  LearningPathDetail,
  learningPathService,
} from "@/lib/api/learning-path-service";
import { LearningPathData, openRouterService } from "@/lib/api/openrouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  BookOpen,
  CheckCircle,
  Clock,
  Copy,
  Download,
  Eye,
  GraduationCap,
  Lightbulb,
  Loader2,
  Plus,
  RotateCcw,
  Star,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

const initialQuestions = [
  {
    id: "goal",
    question: "What is your primary learning goal?",
    type: "textarea",
    placeholder: "I want to learn...",
  },
  {
    id: "background",
    question: "What is your current knowledge or background in this area?",
    type: "select",
    options: [
      { value: "beginner", label: "Beginner (No prior knowledge)" },
      { value: "novice", label: "Novice (Some basic concepts)" },
      {
        value: "intermediate",
        label: "Intermediate (Familiar with fundamentals)",
      },
      { value: "advanced", label: "Advanced (Solid understanding)" },
      {
        value: "expert",
        label: "Expert (Deep knowledge, seeking specialization)",
      },
    ],
  },
  {
    id: "timeCommitment",
    question: "How much time can you commit to learning each week?",
    type: "radio",
    options: [
      { value: "minimal", label: "Minimal (1-3 hours)" },
      { value: "moderate", label: "Moderate (4-7 hours)" },
      { value: "significant", label: "Significant (8-15 hours)" },
      { value: "intensive", label: "Intensive (15+ hours)" },
    ],
  },
  {
    id: "preferredStyle",
    question: "What learning style do you prefer?",
    type: "select",
    options: [
      { value: "visual", label: "Visual (videos, diagrams, infographics)" },
      { value: "reading", label: "Reading (articles, books, documentation)" },
      {
        value: "interactive",
        label: "Interactive (exercises, quizzes, coding)",
      },
      {
        value: "project-based",
        label: "Project-based (building real applications)",
      },
      {
        value: "social",
        label: "Social (group discussions, pair programming)",
      },
    ],
  },
];

export default function PersonalizedLearningPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isGeneratingPath, setIsGeneratingPath] = useState(false);
  const [learningPath, setLearningPath] = useState<LearningPathData | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("questions");
  const [selectedPath, setSelectedPath] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pathDetails, setPathDetails] = useState<LearningPathDetail | null>(
    null
  );

  const currentQuestion = initialQuestions[currentQuestionIndex];

  const {
    data: savedPaths,
    isLoading,
    error,
  } = useQuery({
    queryFn: () => learningPathService.getAllPaths(),
    queryKey: ["savedLearningPaths"],
  });

  const { data: pathDetail, isLoading: isLoadingPathDetail } = useQuery({
    queryFn: () => {
      if (selectedPath) {
        return learningPathService.getPath(selectedPath);
      }
      return Promise.resolve(null);
    },
    queryKey: ["learningPathDetail", selectedPath],
    enabled: !!selectedPath,
  });

  // Set path details when data is fetched
  React.useEffect(() => {
    if (pathDetail) {
      setPathDetails(pathDetail);
      setDialogOpen(true);
    }
  }, [pathDetail]);

  const openPathPreview = (pathId: number) => {
    setSelectedPath(pathId);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedPath(null);
    setPathDetails(null);
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = () => {
    if (!answers[currentQuestion.id]) {
      toast("Please answer the question", {
        description: "Your input is needed to create a personalized path.",
      });
      return;
    }

    if (currentQuestionIndex < initialQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      generateLearningPath();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const generateLearningPath = async () => {
    setIsGeneratingPath(true);
    setActiveTab("result");

    try {
      const response: any = await openRouterService.generateLearningPath(
        answers
      );

      const path = JSON.parse(response);
      setLearningPath(path);

      // Save the learning path to the backend
      try {
        await learningPathService.createPath({
          path_data: response,
          learning_goal: answers.goal,
          background: answers.background,
          time_commitment: answers.timeCommitment,
          preferred_style: answers.preferredStyle,
          title: `Learning Path - ${new Date().toLocaleDateString()}`,
        });

        // Show success message about saving to backend
        toast("Learning path saved", {
          description:
            "Your personalized learning path has been saved to your account.",
        });
      } catch (saveError) {
        console.error("Error saving learning path:", saveError);
        // We don't show an error here as the path generation was successful,
        // even if saving to backend failed
      }
    } catch (error) {
      console.error("Error generating learning path:", error);
      toast("Error generating learning path", {
        description:
          "There was an error creating your personalized learning path. Please try again.",
      });
      setLearningPath(null);
    } finally {
      setIsGeneratingPath(false);
    }
  };

  const resetForm = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setLearningPath(null);
    setActiveTab("questions");
  };

  const renderQuestion = () => {
    const question = initialQuestions[currentQuestionIndex];

    switch (question.type) {
      case "textarea":
        return (
          <div className="space-y-2">
            <Label htmlFor={question.id}>{question.question}</Label>
            <Textarea
              id={question.id}
              placeholder={question.placeholder}
              value={answers[question.id] || ""}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              className="min-h-32"
            />
          </div>
        );

      case "select":
        return (
          <div className="space-y-2">
            <Label htmlFor={question.id}>{question.question}</Label>
            <Select
              value={answers[question.id]}
              onValueChange={(value) => handleAnswer(question.id, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {question.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "radio":
        return (
          <div className="space-y-3">
            <Label>{question.question}</Label>
            <RadioGroup
              value={answers[question.id]}
              onValueChange={(value) => handleAnswer(question.id, value)}
              className="flex flex-col space-y-2"
            >
              {question.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mx-8 space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">
          Personalized Learning Path
        </h1>
        <p className="text-muted-foreground mt-1">
          Get a customized learning journey based on your goals and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger
            value="result"
            disabled={!learningPath && !isGeneratingPath}
          >
            Your Learning Path
          </TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="inline-flex justify-center items-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                  {currentQuestionIndex + 1}
                </span>
                <span>
                  Question {currentQuestionIndex + 1} of{" "}
                  {initialQuestions.length}
                </span>
              </CardTitle>
              <CardDescription>
                Help us understand your learning needs and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>{renderQuestion()}</CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              <Button onClick={handleNext}>
                {currentQuestionIndex < initialQuestions.length - 1
                  ? "Next"
                  : "Generate Learning Path"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="result" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Your Personalized Learning Path
              </CardTitle>
              <CardDescription>
                Based on your goals, background, and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isGeneratingPath ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">
                    Creating your personalized learning journey...
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {!learningPath ? (
                    <p className="text-muted-foreground text-center py-4">
                      No learning path available. Please try again.
                    </p>
                  ) : (
                    <>
                      {/* Assessment Section */}
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold mb-2">
                          Assessment
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="p-4 bg-muted/50">
                            <h4 className="font-medium mb-1">
                              Current Knowledge Level
                            </h4>
                            <p className="text-muted-foreground">
                              {learningPath.assessment?.level ||
                                "Not specified"}
                            </p>
                          </Card>
                          <Card className="p-4 bg-muted/50">
                            <h4 className="font-medium mb-1">Learning Goals</h4>
                            <p className="text-muted-foreground">
                              {learningPath.assessment?.goals ||
                                "Not specified"}
                            </p>
                          </Card>
                        </div>
                      </div>

                      {/* Timeline Summary */}
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                          <Clock className="h-5 w-5 text-primary" />
                          Timeline
                        </h3>
                        <Card className="p-4 bg-muted/50">
                          <div className="mb-2">
                            <span className="font-medium">Total Duration:</span>{" "}
                            {learningPath.timeline?.totalDuration ||
                              "Not specified"}
                          </div>
                          <div>
                            <span className="font-medium">Breakdown:</span>{" "}
                            {learningPath.timeline?.breakdown ||
                              "Not specified"}
                          </div>
                        </Card>
                      </div>

                      {/* Learning Path Stages */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                          <GraduationCap className="h-5 w-5 text-primary" />
                          Learning Journey
                        </h3>

                        {learningPath.learningPath?.map((stage, index) => (
                          <Card
                            key={index}
                            className="border-l-4 border-l-primary"
                          >
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg">
                                Stage {index + 1}: {stage.stage}
                                <div className="text-sm font-normal text-muted-foreground mt-1">
                                  Duration: {stage.duration || "Not specified"}
                                </div>
                              </CardTitle>
                              <CardDescription>
                                {stage.description ||
                                  "No description available"}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-0">
                              {/* Milestones */}
                              {stage.milestones?.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2 text-sm">
                                    Milestones
                                  </h4>
                                  <ul className="list-disc pl-5 space-y-1 text-sm">
                                    {stage.milestones.map((milestone, idx) => (
                                      <li key={idx}>
                                        <span className="font-medium">
                                          {milestone.name}:
                                        </span>{" "}
                                        {milestone.description ||
                                          "No description available"}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Resources */}
                              {stage.resources?.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2 text-sm">
                                    Resources
                                  </h4>
                                  <ul className="list-disc pl-5 space-y-2 text-sm">
                                    {stage.resources.map((resource, idx) => (
                                      <li key={idx}>
                                        <div className="font-medium">
                                          {resource.url ? (
                                            <a
                                              href={resource.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-primary hover:underline flex items-center"
                                            >
                                              {resource.name}{" "}
                                              <span className="text-muted-foreground ml-1">
                                                ({resource.type})
                                              </span>
                                            </a>
                                          ) : (
                                            <span>
                                              {resource.name}{" "}
                                              <span className="text-muted-foreground">
                                                ({resource.type})
                                              </span>
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-muted-foreground text-xs">
                                          {resource.description ||
                                            "No description available"}
                                        </p>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Projects */}
                              {stage.projects?.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2 text-sm">
                                    Practice Projects
                                  </h4>
                                  <ul className="list-disc pl-5 space-y-1 text-sm">
                                    {stage.projects.map((project, idx) => (
                                      <li key={idx}>
                                        <span className="font-medium">
                                          {project.name}:
                                        </span>{" "}
                                        {project.description ||
                                          "No description available"}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {/* Learning Tips */}
                      {learningPath.tips?.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-primary" />
                            Tips for Success
                          </h3>
                          <Card className="p-4">
                            <ul className="list-disc pl-5 space-y-1">
                              {learningPath.tips.map((tip, index) => (
                                <li
                                  key={index}
                                  className="text-muted-foreground"
                                >
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </Card>
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex flex-wrap gap-2 justify-end">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => {
                        const learningPathText = JSON.stringify(
                          learningPath,
                          null,
                          2
                        );
                        navigator.clipboard.writeText(learningPathText);
                        toast("Copied to clipboard", {
                          description:
                            "Learning path has been copied to your clipboard.",
                        });
                      }}
                      disabled={!learningPath}
                    >
                      <Copy className="h-4 w-4" />
                      Copy to Clipboard
                    </Button>

                    <Button
                      variant="default"
                      className="flex items-center gap-2"
                      onClick={async () => {
                        if (!learningPath) return;

                        try {
                          // Extract title from the assessment goals or create a default one
                          const title = learningPath.assessment?.goals
                            ? `Learning Path: ${
                                learningPath.assessment.goals.split(".")[0]
                              }`
                            : `Learning Path ${new Date().toLocaleDateString()}`;

                          const response = await learningPathService.createPath(
                            {
                              title: title,
                              path_data: JSON.stringify(learningPath),
                              learning_goal: answers.goal || "",
                              background: answers.background || "",
                              time_commitment: answers.timeCommitment || "",
                              preferred_style: answers.learningStyle || "",
                            }
                          );

                          toast("Learning Path Saved", {
                            description:
                              "Your learning path has been saved successfully.",
                          });

                          // Optionally navigate to the learning path detail view
                          // router.push(`/dashboard/candidate/learning-paths/${response.id}`);
                        } catch (error) {
                          toast.error("Error", {
                            description:
                              "Failed to save learning path. Please try again.",
                          });
                          console.error("Failed to save learning path:", error);
                        }
                      }}
                      disabled={!learningPath}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Save Learning Path
                    </Button>

                    <Button
                      variant="secondary"
                      className="flex items-center gap-2"
                      onClick={() => {
                        if (!learningPath) return;

                        // Convert the learning path to a well-formatted markdown string
                        let mdContent = `# Personalized Learning Path\n\n`;

                        // Assessment
                        mdContent += `## Assessment\n\n`;
                        mdContent += `**Current Knowledge Level:** ${learningPath.assessment.level}\n\n`;
                        mdContent += `**Learning Goals:** ${learningPath.assessment.goals}\n\n`;

                        // Timeline
                        mdContent += `## Timeline\n\n`;
                        mdContent += `**Total Duration:** ${learningPath.timeline.totalDuration}\n\n`;
                        mdContent += `**Breakdown:** ${learningPath.timeline.breakdown}\n\n`;

                        // Learning Path
                        mdContent += `## Learning Journey\n\n`;

                        learningPath.learningPath.forEach((stage, index) => {
                          mdContent += `### Stage ${index + 1}: ${
                            stage.stage
                          } (${stage.duration})\n\n`;
                          mdContent += `${stage.description}\n\n`;

                          // Milestones
                          if (stage.milestones.length > 0) {
                            mdContent += `#### Milestones\n\n`;
                            stage.milestones.forEach((milestone) => {
                              mdContent += `- **${milestone.name}:** ${milestone.description}\n`;
                            });
                            mdContent += `\n`;
                          }

                          // Resources
                          if (stage.resources.length > 0) {
                            mdContent += `#### Resources\n\n`;
                            stage.resources.forEach((resource) => {
                              if (resource.url) {
                                mdContent += `- [${resource.name}](${resource.url}) (${resource.type}): ${resource.description}\n`;
                              } else {
                                mdContent += `- **${resource.name}** (${resource.type}): ${resource.description}\n`;
                              }
                            });
                            mdContent += `\n`;
                          }

                          // Projects
                          if (stage.projects.length > 0) {
                            mdContent += `#### Practice Projects\n\n`;
                            stage.projects.forEach((project) => {
                              mdContent += `- **${project.name}:** ${project.description}\n`;
                            });
                            mdContent += `\n`;
                          }
                        });

                        // Tips
                        if (learningPath.tips.length > 0) {
                          mdContent += `## Tips for Success\n\n`;
                          learningPath.tips.forEach((tip) => {
                            mdContent += `- ${tip}\n`;
                          });
                        }

                        const blob = new Blob([mdContent], {
                          type: "text/markdown",
                        });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = "personalized-learning-path.md";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                        toast("Downloaded", {
                          description:
                            "Your learning path has been saved as a Markdown file.",
                        });
                      }}
                      disabled={!learningPath}
                    >
                      <Download className="h-4 w-4" />
                      Save as Markdown
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setActiveTab("questions")}
              >
                View Questions
              </Button>
              <Button variant="secondary" onClick={resetForm}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Start Over
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-1">
              <CheckCircle className="h-5 w-5 text-primary" />
              Personalized
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Tailored recommendations based on your specific goals and
              background
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-1">
              <Clock className="h-5 w-5 text-primary" />
              Time-Efficient
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Learning paths designed to match your available time commitment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-1">
              <GraduationCap className="h-5 w-5 text-primary" />
              Comprehensive
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Includes resources, projects, and milestones to track your
              progress
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Your Learning Paths</h2>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card className="p-6 text-center text-muted-foreground">
            <p>Error loading your learning paths. Please try again later.</p>
          </Card>
        ) : !savedPaths?.length ? (
          <Card className="p-6 text-center text-muted-foreground">
            <p className="mb-3">You haven't created any learning paths yet.</p>
            <Button
              onClick={() => setActiveTab("questions")}
              className="inline-flex items-center"
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Path
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedPaths.map((path) => (
              <Card key={path.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{path.title}</span>
                    {path.is_favorite && (
                      <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Created on {format(new Date(path.created_at), "PPP")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {path.learning_goal || "No description available"}
                  </p>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center"
                    onClick={() => openPathPreview(path.id)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Path
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Learning Path Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {isLoadingPathDetail || !pathDetails ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {pathDetails.title}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2">
                  <Badge variant="outline" className="font-normal">
                    Created on {format(new Date(pathDetails.created_at), "PPP")}
                  </Badge>
                  <Badge variant="secondary" className="font-normal">
                    {pathDetails.background || "Knowledge level not specified"}
                  </Badge>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Learning Goal */}
                <div>
                  <h3 className="text-lg font-semibold">Learning Goal</h3>
                  <p className="text-muted-foreground">
                    {pathDetails.learning_goal}
                  </p>
                </div>

                {pathDetails.path_data && (
                  <>
                    {/* Assessment */}
                    {pathDetails.path_data.assessment && (
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Assessment</h3>
                        <Card className="p-4 bg-muted/50">
                          {pathDetails.path_data.assessment.level && (
                            <div className="mb-2">
                              <span className="font-medium">
                                Knowledge Level:
                              </span>{" "}
                              {pathDetails.path_data.assessment.level}
                            </div>
                          )}
                          {pathDetails.path_data.assessment.goals && (
                            <div>
                              <span className="font-medium">Goals:</span>{" "}
                              {pathDetails.path_data.assessment.goals}
                            </div>
                          )}
                        </Card>
                      </div>
                    )}

                    {/* Timeline */}
                    {pathDetails.path_data.timeline && (
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Clock className="h-5 w-5 text-primary" />
                          Timeline
                        </h3>
                        <Card className="p-4 bg-muted/50">
                          {pathDetails.path_data.timeline.totalDuration && (
                            <div className="mb-2">
                              <span className="font-medium">
                                Total Duration:
                              </span>{" "}
                              {pathDetails.path_data.timeline.totalDuration}
                            </div>
                          )}
                          {pathDetails.path_data.timeline.breakdown && (
                            <div>
                              <span className="font-medium">Breakdown:</span>{" "}
                              {pathDetails.path_data.timeline.breakdown}
                            </div>
                          )}
                        </Card>
                      </div>
                    )}

                    {/* Learning Stages */}
                    {pathDetails.path_data.learningPath &&
                      pathDetails.path_data.learningPath.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            Learning Path
                          </h3>
                          <div className="space-y-4">
                            {pathDetails.path_data.learningPath.map(
                              (stage: any, index: number) => (
                                <Card
                                  key={index}
                                  className="border-l-4 border-l-primary"
                                >
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">
                                      Stage {index + 1}: {stage.stage}
                                      {stage.duration && (
                                        <span className="text-sm font-normal text-muted-foreground ml-2">
                                          ({stage.duration})
                                        </span>
                                      )}
                                    </CardTitle>
                                    <CardDescription>
                                      {stage.description ||
                                        "No description available"}
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent className="space-y-4 pt-0">
                                    {/* Milestones */}
                                    {stage.milestones &&
                                      stage.milestones.length > 0 && (
                                        <div>
                                          <h4 className="font-medium mb-2 text-sm">
                                            Milestones
                                          </h4>
                                          <ul className="list-disc pl-5 space-y-1 text-sm">
                                            {stage.milestones.map(
                                              (milestone: any, idx: number) => (
                                                <li key={idx}>
                                                  <span className="font-medium">
                                                    {milestone.name}:
                                                  </span>{" "}
                                                  {milestone.description ||
                                                    "No description"}
                                                </li>
                                              )
                                            )}
                                          </ul>
                                        </div>
                                      )}

                                    {/* Resources */}
                                    {stage.resources &&
                                      stage.resources.length > 0 && (
                                        <div>
                                          <h4 className="font-medium mb-2 text-sm">
                                            Resources
                                          </h4>
                                          <ul className="list-disc pl-5 space-y-2 text-sm">
                                            {stage.resources.map(
                                              (resource: any, idx: number) => (
                                                <li key={idx}>
                                                  <div className="font-medium">
                                                    {resource.url ? (
                                                      <a
                                                        href={resource.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary hover:underline flex items-center"
                                                      >
                                                        {resource.name}{" "}
                                                        <span className="text-muted-foreground ml-1">
                                                          ({resource.type})
                                                        </span>
                                                      </a>
                                                    ) : (
                                                      <span>
                                                        {resource.name}{" "}
                                                        <span className="text-muted-foreground">
                                                          ({resource.type})
                                                        </span>
                                                      </span>
                                                    )}
                                                  </div>
                                                  <p className="text-muted-foreground text-xs">
                                                    {resource.description ||
                                                      "No description"}
                                                  </p>
                                                </li>
                                              )
                                            )}
                                          </ul>
                                        </div>
                                      )}

                                    {/* Projects */}
                                    {stage.projects &&
                                      stage.projects.length > 0 && (
                                        <div>
                                          <h4 className="font-medium mb-2 text-sm">
                                            Practice Projects
                                          </h4>
                                          <ul className="list-disc pl-5 space-y-1 text-sm">
                                            {stage.projects.map(
                                              (project: any, idx: number) => (
                                                <li key={idx}>
                                                  <span className="font-medium">
                                                    {project.name}:
                                                  </span>{" "}
                                                  {project.description ||
                                                    "No description"}
                                                </li>
                                              )
                                            )}
                                          </ul>
                                        </div>
                                      )}
                                  </CardContent>
                                </Card>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Tips */}
                    {pathDetails.path_data.tips &&
                      pathDetails.path_data.tips.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-primary" />
                            Tips for Success
                          </h3>
                          <Card className="p-4">
                            <ul className="list-disc pl-5 space-y-1">
                              {pathDetails.path_data.tips.map(
                                (tip: any, index: number) => (
                                  <li
                                    key={index}
                                    className="text-muted-foreground"
                                  >
                                    {tip}
                                  </li>
                                )
                              )}
                            </ul>
                          </Card>
                        </div>
                      )}
                  </>
                )}
              </div>

              <DialogFooter className="flex flex-wrap gap-2">
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
                <Button onClick={() => setActiveTab("questions")}>
                  Create New Path
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
