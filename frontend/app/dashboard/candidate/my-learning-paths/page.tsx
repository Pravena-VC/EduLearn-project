"use client";

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
  learningPathService,
  type LearningPathSummary,
} from "@/lib/api/learning-path-service";
import { GraduationCap, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function MySavedPathsPage() {
  const [learningPaths, setLearningPaths] = useState<LearningPathSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLearningPaths = async () => {
      try {
        const paths = await learningPathService.getAllPaths();
        setLearningPaths(paths);
      } catch (error) {
        console.error("Error fetching learning paths:", error);
        toast("Error loading learning paths", {
          description: "There was an error loading your saved learning paths.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLearningPaths();
  }, []);

  const handleDelete = async (pathId: number) => {
    try {
      await learningPathService.deletePath(pathId);
      setLearningPaths((prev) => prev.filter((path) => path.id !== pathId));
      toast("Learning path deleted", {
        description: "Your learning path has been deleted.",
      });
    } catch (error) {
      console.error("Error deleting learning path:", error);
      toast("Error deleting learning path", {
        description: "There was an error deleting your learning path.",
      });
    }
  };

  const handleToggleFavorite = async (
    pathId: number,
    currentStatus: boolean
  ) => {
    try {
      await learningPathService.updatePath(pathId, {
        is_favorite: !currentStatus,
      });

      setLearningPaths((prev) =>
        prev.map((path) =>
          path.id === pathId ? { ...path, is_favorite: !currentStatus } : path
        )
      );

      toast(currentStatus ? "Removed from favorites" : "Added to favorites", {
        description: currentStatus
          ? "Learning path removed from favorites."
          : "Learning path added to favorites.",
      });
    } catch (error) {
      console.error("Error updating learning path:", error);
      toast("Error updating learning path", {
        description: "There was an error updating your learning path.",
      });
    }
  };

  return (
    <div className="mx-8 space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">My Learning Paths</h1>
        <p className="text-muted-foreground mt-1">
          Access and manage your saved personalized learning paths
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-muted-foreground">
            Loading your learning paths...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningPaths.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground mb-4">
                You don't have any saved learning paths yet.
              </p>
              <Link href="/dashboard/candidate/personalized-learning" passHref>
                <Button>Create Your First Learning Path</Button>
              </Link>
            </div>
          ) : (
            learningPaths.map((path) => (
              <Card
                key={path.id}
                className={path.is_favorite ? "border-primary" : ""}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <span className="leading-6 break-words">{path.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        handleToggleFavorite(path.id, path.is_favorite)
                      }
                    >
                      <span
                        className={`text-2xl ${
                          path.is_favorite
                            ? "text-yellow-500"
                            : "text-muted-foreground"
                        }`}
                      >
                        {path.is_favorite ? "★" : "☆"}
                      </span>
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Created on {new Date(path.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {path.learning_goal}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Link
                    href={`/dashboard/candidate/learning-paths/${path.id}`}
                    passHref
                  >
                    <Button
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <GraduationCap className="h-4 w-4" />
                      View Path
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive/90"
                    onClick={() => handleDelete(path.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
