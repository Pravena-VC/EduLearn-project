"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, CheckCircle, Lock } from "lucide-react";
import Link from "next/link";

export default function LearningPathPage() {
  const pathCourses = [
    {
      id: 1,
      title: "HTML & CSS Fundamentals",
      description: "Learn the building blocks of the web",
      status: "in-progress",
      duration: "4 weeks",
      level: "Beginner",
    },
    {
      id: 2,
      title: "JavaScript Essentials",
      description: "Master the core concepts of JavaScript programming",
      status: "locked",
      duration: "6 weeks",
      level: "Beginner",
    },
    {
      id: 3,
      title: "React Fundamentals",
      description: "Build interactive UIs with the React library",
      status: "locked",
      duration: "8 weeks",
      level: "Intermediate",
    },
    {
      id: 4,
      title: "Node.js Basics",
      description: "Server-side JavaScript development",
      status: "locked",
      duration: "6 weeks",
      level: "Intermediate",
      progress: 75,
    },
    {
      id: 5,
      title: "Database Design",
      description: "Learn SQL and NoSQL database principles",
      status: "locked",
      duration: "5 weeks",
      level: "Intermediate",
    },
    {
      id: 6,
      title: "API Development",
      description: "Create and consume RESTful APIs",
      status: "locked",
      duration: "4 weeks",
      level: "Intermediate",
    },
    {
      id: 7,
      title: "Authentication & Security",
      description: "Implement secure authentication systems",
      status: "locked",
      duration: "3 weeks",
      level: "Advanced",
    },
    {
      id: 8,
      title: "Deployment & DevOps",
      description: "Deploy applications to production",
      status: "locked",
      duration: "4 weeks",
      level: "Advanced",
    },
  ];

  return (
    <div className="space-y-8 mx-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Learning Paths</h1>
        <p className="text-muted-foreground mt-1">
          Structured learning journeys tailored to your career goals
        </p>
      </div>

      <div id="path-courses" className="space-y-4 pt-4">
        <div>
          <h2 className="text-xl font-bold">Full-Stack Web Development Path</h2>
          <p className="text-muted-foreground">
            Progress through these expertly curated courses to become a
            full-stack developer.
          </p>
          <p className="mt-2 text-sm text-primary">
            Handpicked by our AI—this personalized path is designed to
            accelerate your growth and success.
          </p>
        </div>

        <div className="space-y-6">
          {pathCourses.map((course, index) => (
            <Card key={course.id}>
              <div className="flex items-center p-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                  <span className="font-bold text-lg">{index + 1}</span>
                </div>
                <div className="ml-4 flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{course.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {course.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{course.level}</Badge>
                      <Badge variant="outline">{course.duration}</Badge>
                    </div>
                  </div>

                  {course.status === "in-progress" && (
                    <div className="pt-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2 mt-1" />
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  {course.status === "completed" ? (
                    <div className="flex items-center text-primary">
                      <CheckCircle className="h-5 w-5 mr-1" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                  ) : course.status === "in-progress" ? (
                    <Button asChild>
                      <Link href={`/courses/${course.id}`}>
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" disabled={true}>
                      <Lock className="mr-2 h-4 w-4" />
                      Locked
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
