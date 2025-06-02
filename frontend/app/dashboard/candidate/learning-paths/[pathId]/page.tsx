"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { learningPathService } from "@/lib/api/learning-path-service";
import {
  ArrowLeft,
  Clock,
  Copy,
  Download,
  GraduationCap,
  Lightbulb,
  Loader2,
  Save,
  X,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export default function LearningPathDetailPage({
  params,
}: {
  params: Promise<{ pathId: string }>;
}) {
  let params_ = React.use(params);

  const pathId = parseInt(params_.pathId, 10);

  const [learningPath, setLearningPath] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");

  useEffect(() => {
    const fetchLearningPath = async () => {
      try {
        const path = await learningPathService.getPath(pathId);
        setLearningPath(path);
        setTitle(path.title || "");
      } catch (error) {
        console.error("Error fetching learning path:", error);
        toast("Error loading learning path", {
          description: "There was an error loading your learning path.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLearningPath();
  }, [pathId]);

  const handleSaveTitle = async () => {
    try {
      await learningPathService.updatePath(pathId, { title });
      setIsEditing(false);
      toast("Title updated", {
        description: "Your learning path title has been updated.",
      });
    } catch (error) {
      console.error("Error updating title:", error);
      toast("Error updating title", {
        description: "There was an error updating the title.",
      });
    }
  };

  const handleToggleFavorite = async () => {
    try {
      await learningPathService.updatePath(pathId, {
        is_favorite: !learningPath.is_favorite,
      });
      setLearningPath({
        ...learningPath,
        is_favorite: !learningPath.is_favorite,
      });
      toast(
        learningPath.is_favorite
          ? "Removed from favorites"
          : "Added to favorites",
        {
          description: learningPath.is_favorite
            ? "Learning path removed from favorites."
            : "Learning path added to favorites.",
        }
      );
    } catch (error) {
      console.error("Error updating learning path:", error);
      toast("Error updating learning path", {
        description: "There was an error updating your learning path.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="mx-8 flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your learning path...</p>
      </div>
    );
  }

  if (!learningPath) {
    return (
      <div className="mx-8 space-y-4">
        <Link href="/dashboard/candidate/my-learning-paths" passHref>
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Learning Paths
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            Learning path not found or you don't have access to it.
          </p>
        </div>
      </div>
    );
  }

  // Parse the path_data JSON
  const pathData = learningPath.path_data;

  return (
    <div className="mx-8 space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/candidate/my-learning-paths" passHref>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="flex-grow">
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="max-w-md"
                autoFocus
              />
              <Button size="icon" onClick={handleSaveTitle}>
                <Save className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsEditing(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center">
              <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
            </div>
          )}
          <p className="text-muted-foreground mt-1">
            {new Date(learningPath.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Assessment Section */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold mb-2">Assessment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 bg-muted/50">
              <h4 className="font-medium mb-1">Current Knowledge Level</h4>
              <p className="text-muted-foreground">
                {pathData.assessment?.level || "Not specified"}
              </p>
            </Card>
            <Card className="p-4 bg-muted/50">
              <h4 className="font-medium mb-1">Learning Goals</h4>
              <p className="text-muted-foreground">
                {pathData.assessment?.goals || "Not specified"}
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
              {pathData.timeline?.totalDuration || "Not specified"}
            </div>
            <div>
              <span className="font-medium">Breakdown:</span>{" "}
              {pathData.timeline?.breakdown || "Not specified"}
            </div>
          </Card>
        </div>

        {/* Learning Path Stages */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Learning Journey
          </h3>

          {pathData.learningPath?.map((stage: any, index: number) => (
            <Card key={index} className="border-l-4 border-l-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Stage {index + 1}: {stage.stage}
                  <div className="text-sm font-normal text-muted-foreground mt-1">
                    Duration: {stage.duration || "Not specified"}
                  </div>
                </CardTitle>
                <CardDescription>
                  {stage.description || "No description available"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                {/* Milestones */}
                {stage.milestones?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-sm">Milestones</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {stage.milestones.map((milestone: any, idx: number) => (
                        <li key={idx}>
                          <span className="font-medium">{milestone.name}:</span>{" "}
                          {milestone.description || "No description available"}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Resources */}
                {stage.resources?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-sm">Resources</h4>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      {stage.resources.map((resource: any, idx: number) => (
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
                            {resource.description || "No description available"}
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
                      {stage.projects.map((project: any, idx: number) => (
                        <li key={idx}>
                          <span className="font-medium">{project.name}:</span>{" "}
                          {project.description || "No description available"}
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
        {pathData.tips?.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Tips for Success
            </h3>
            <Card className="p-4">
              <ul className="list-disc pl-5 space-y-1">
                {pathData.tips.map((tip: string, index: number) => (
                  <li key={index} className="text-muted-foreground">
                    {tip}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}

        <div className="flex flex-wrap gap-2 justify-end">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => {
              const learningPathText = JSON.stringify(pathData, null, 2);
              navigator.clipboard.writeText(learningPathText);
              toast("Copied to clipboard", {
                description: "Learning path has been copied to your clipboard.",
              });
            }}
          >
            <Copy className="h-4 w-4" />
            Copy to Clipboard
          </Button>

          <Button
            variant="secondary"
            className="flex items-center gap-2"
            onClick={() => {
              let mdContent = `# ${title || "Personalized Learning Path"}\n\n`;

              mdContent += `## Assessment\n\n`;
              mdContent += `**Current Knowledge Level:** ${pathData.assessment.level}\n\n`;
              mdContent += `**Learning Goals:** ${pathData.assessment.goals}\n\n`;

              mdContent += `## Timeline\n\n`;
              mdContent += `**Total Duration:** ${pathData.timeline.totalDuration}\n\n`;
              mdContent += `**Breakdown:** ${pathData.timeline.breakdown}\n\n`;

              mdContent += `## Learning Journey\n\n`;

              pathData.learningPath.forEach((stage: any, index: number) => {
                mdContent += `### Stage ${index + 1}: ${stage.stage} (${
                  stage.duration
                })\n\n`;
                mdContent += `${stage.description}\n\n`;

                // Milestones
                if (stage.milestones?.length > 0) {
                  mdContent += `#### Milestones\n\n`;
                  stage.milestones.forEach((milestone: any) => {
                    mdContent += `- **${milestone.name}:** ${milestone.description}\n`;
                  });
                  mdContent += `\n`;
                }

                if (stage.resources?.length > 0) {
                  mdContent += `#### Resources\n\n`;
                  stage.resources.forEach((resource: any) => {
                    if (resource.url) {
                      mdContent += `- [${resource.name}](${resource.url}) (${resource.type}): ${resource.description}\n`;
                    } else {
                      mdContent += `- **${resource.name}** (${resource.type}): ${resource.description}\n`;
                    }
                  });
                  mdContent += `\n`;
                }

                // Projects
                if (stage.projects?.length > 0) {
                  mdContent += `#### Practice Projects\n\n`;
                  stage.projects.forEach((project: any) => {
                    mdContent += `- **${project.name}:** ${project.description}\n`;
                  });
                  mdContent += `\n`;
                }
              });

              // Tips
              if (pathData.tips?.length > 0) {
                mdContent += `## Tips for Success\n\n`;
                pathData.tips.forEach((tip: string) => {
                  mdContent += `- ${tip}\n`;
                });
              }

              const blob = new Blob([mdContent], {
                type: "text/markdown",
              });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `${title || "learning-path"}.md`
                .toLowerCase()
                .replace(/\s+/g, "-");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              toast("Downloaded", {
                description:
                  "Your learning path has been saved as a Markdown file.",
              });
            }}
          >
            <Download className="h-4 w-4" />
            Save as Markdown
          </Button>
        </div>
      </div>
    </div>
  );
}
