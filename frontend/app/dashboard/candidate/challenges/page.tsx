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
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Code,
  Search,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ChallengesPage() {
  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  // Sample challenges data
  const challenges = [
    {
      id: 1,
      title: "Binary Search Implementation",
      description:
        "Implement a binary search algorithm for an array of integers",
      category: "Algorithms",
      difficulty: "Medium",
      status: "completed",
      completedOn: "April 28, 2025",
      score: 95,
      maxScore: 100,
      timeSpent: "45 minutes",
      points: 150,
      tags: ["algorithms", "binary-search", "arrays"],
    },
    {
      id: 2,
      title: "Responsive Navigation Bar",
      description:
        "Create a responsive navigation bar with HTML, CSS, and JavaScript",
      category: "Web Development",
      difficulty: "Easy",
      status: "completed",
      completedOn: "April 25, 2025",
      score: 100,
      maxScore: 100,
      timeSpent: "30 minutes",
      points: 100,
      tags: ["html", "css", "javascript", "responsive-design"],
    },
    {
      id: 3,
      title: "Database Query Optimization",
      description: "Optimize a slow-running SQL query to improve performance",
      category: "Databases",
      difficulty: "Hard",
      status: "in-progress",
      progress: 60,
      timeSpent: "1 hour 15 minutes",
      points: 200,
      tags: ["sql", "database", "optimization", "performance"],
    },
    {
      id: 4,
      title: "API Authentication System",
      description: "Implement JWT-based authentication for a REST API",
      category: "Backend",
      difficulty: "Medium",
      status: "in-progress",
      progress: 40,
      timeSpent: "45 minutes",
      points: 150,
      tags: ["api", "authentication", "jwt", "security"],
    },
    {
      id: 5,
      title: "State Management with Redux",
      description: "Build a shopping cart with React and Redux",
      category: "Web Development",
      difficulty: "Medium",
      status: "not-started",
      points: 150,
      tags: ["react", "redux", "state-management", "frontend"],
    },
    {
      id: 6,
      title: "Data Visualization Dashboard",
      description:
        "Create an interactive data visualization dashboard with D3.js",
      category: "Data Science",
      difficulty: "Hard",
      status: "not-started",
      points: 200,
      tags: ["d3", "data-visualization", "javascript", "charts"],
    },
  ];

  // Sample weekly challenges
  const weeklyChallenge = {
    id: 7,
    title: "Microservices Architecture",
    description:
      "Design and implement a basic microservices system with two services communicating via an API gateway",
    category: "System Design",
    difficulty: "Hard",
    endsOn: "May 7, 2025",
    daysLeft: 5,
    participants: 246,
    points: 300,
    tags: ["microservices", "system-design", "api-gateway"],
  };

  // Filter challenges
  const filteredChallenges = challenges.filter((challenge) => {
    // Filter by search
    if (
      searchQuery &&
      !challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !challenge.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) &&
      !challenge.tags.some((tag) => tag.includes(searchQuery.toLowerCase()))
    ) {
      return false;
    }

    // Filter by category
    if (categoryFilter !== "all" && challenge.category !== categoryFilter) {
      return false;
    }

    // Filter by difficulty
    if (
      difficultyFilter !== "all" &&
      challenge.difficulty !== difficultyFilter
    ) {
      return false;
    }

    return true;
  });

  // Get unique categories from challenges
  const categories = [
    "all",
    ...new Set(challenges.map((challenge) => challenge.category)),
  ];

  // Calculate total stats
  const totalCompleted = challenges.filter(
    (c) => c.status === "completed"
  ).length;
  const totalInProgress = challenges.filter(
    (c) => c.status === "in-progress"
  ).length;
  const totalPoints = challenges.reduce((sum, challenge) => {
    if (challenge.status === "completed") {
      return sum + challenge.points;
    }
    return sum;
  }, 0);

  return (
    <div className="space-y-8 mx-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Challenge Tracker</h1>
        <p className="text-muted-foreground mt-1">
          Track your progress on coding challenges and exercises
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Challenges Completed
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompleted}</div>
            <p className="text-xs text-muted-foreground">
              Out of {challenges.length} total challenges
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInProgress}</div>
            <p className="text-xs text-muted-foreground">
              Continue where you left off
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoints}</div>
            <p className="text-xs text-muted-foreground">
              Keep solving to earn more
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Featured Challenge */}
      <Card className="bg-gradient-to-r from-primary/5 to-blue-500/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center">
                <Badge className="bg-primary/20 text-primary border-primary/10 mb-2">
                  Weekly Challenge
                </Badge>
                <Badge variant="outline" className="ml-2 mb-2">
                  {weeklyChallenge.difficulty}
                </Badge>
              </div>
              <CardTitle>{weeklyChallenge.title}</CardTitle>
              <CardDescription className="mt-1">
                {weeklyChallenge.description}
              </CardDescription>
            </div>
            <div className="hidden md:block">
              <Trophy className="h-12 w-12 text-primary/70" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {weeklyChallenge.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap justify-between text-sm">
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Ends in {weeklyChallenge.daysLeft} days</span>
            </div>
            <div className="text-muted-foreground">
              {weeklyChallenge.participants} participants
            </div>
            <div className="text-primary font-medium">
              {weeklyChallenge.points} points
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href={`/challenges/${weeklyChallenge.id}`}>
              Start Challenge
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Filter Section */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search challenges..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="Easy">Easy</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Challenges</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="not-started">Not Started</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {filteredChallenges.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <Search className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium mt-4">No challenges found</h3>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                We couldn't find any challenges matching your filters. Try
                adjusting your search criteria.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                  setDifficultyFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredChallenges.map((challenge) => (
                <Card key={challenge.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="flex-1 p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                        <div className="flex items-center space-x-2 mb-2 md:mb-0">
                          <Badge
                            variant={
                              challenge.difficulty === "Easy"
                                ? "outline"
                                : challenge.difficulty === "Medium"
                                ? "secondary"
                                : "default"
                            }
                          >
                            {challenge.difficulty}
                          </Badge>
                          <Badge variant="outline">{challenge.category}</Badge>
                        </div>
                        <div className="flex items-center">
                          {challenge.status === "completed" ? (
                            <div className="flex items-center text-green-500">
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              <span className="text-sm">Completed</span>
                              {challenge.score && (
                                <span className="ml-2 text-sm font-medium">
                                  {challenge.score}/{challenge.maxScore}
                                </span>
                              )}
                            </div>
                          ) : challenge.status === "in-progress" ? (
                            <div className="flex items-center text-yellow-500">
                              <Clock className="h-4 w-4 mr-1" />
                              <span className="text-sm">In Progress</span>
                              {challenge.progress && (
                                <span className="ml-2 text-sm font-medium">
                                  {challenge.progress}%
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center text-muted-foreground">
                              <Code className="h-4 w-4 mr-1" />
                              <span className="text-sm">Not Started</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <h3 className="font-medium text-lg">{challenge.title}</h3>
                      <p className="text-muted-foreground text-sm mt-1 mb-3">
                        {challenge.description}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {challenge.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {challenge.status === "completed" && (
                        <div className="text-sm text-muted-foreground">
                          <span>Completed on {challenge.completedOn}</span>
                          <span className="mx-2">•</span>
                          <span>Time spent: {challenge.timeSpent}</span>
                        </div>
                      )}

                      {challenge.status === "in-progress" && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Progress</span>
                            <span>{challenge.progress}%</span>
                          </div>
                          <Progress
                            value={challenge.progress}
                            className="h-2"
                          />
                          <div className="text-sm text-muted-foreground">
                            Time spent so far: {challenge.timeSpent}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-row md:flex-col justify-between items-center bg-muted/20 p-6 md:w-60">
                      <div className="text-center md:mb-4">
                        <div className="text-2xl font-bold text-primary">
                          {challenge.points}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          points
                        </div>
                      </div>
                      <Button
                        asChild
                        variant={
                          challenge.status === "completed"
                            ? "outline"
                            : "default"
                        }
                      >
                        <Link href={`/challenges/${challenge.id}`}>
                          {challenge.status === "completed"
                            ? "View Solution"
                            : challenge.status === "in-progress"
                            ? "Continue"
                            : "Start Challenge"}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <div className="space-y-4">
            {filteredChallenges
              .filter((challenge) => challenge.status === "completed")
              .map((challenge) => (
                <Card key={challenge.id} className="overflow-hidden">
                  {/* Same card content as above, but for completed challenges only */}
                  <div className="flex flex-col md:flex-row">
                    <div className="flex-1 p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                        <div className="flex items-center space-x-2 mb-2 md:mb-0">
                          <Badge
                            variant={
                              challenge.difficulty === "Easy"
                                ? "outline"
                                : challenge.difficulty === "Medium"
                                ? "secondary"
                                : "default"
                            }
                          >
                            {challenge.difficulty}
                          </Badge>
                          <Badge variant="outline">{challenge.category}</Badge>
                        </div>
                        <div className="flex items-center text-green-500">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          <span className="text-sm">Completed</span>
                          {challenge.score && (
                            <span className="ml-2 text-sm font-medium">
                              {challenge.score}/{challenge.maxScore}
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="font-medium text-lg">{challenge.title}</h3>
                      <p className="text-muted-foreground text-sm mt-1 mb-3">
                        {challenge.description}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {challenge.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <span>Completed on {challenge.completedOn}</span>
                        <span className="mx-2">•</span>
                        <span>Time spent: {challenge.timeSpent}</span>
                      </div>
                    </div>
                    <div className="flex flex-row md:flex-col justify-between items-center bg-muted/20 p-6 md:w-60">
                      <div className="text-center md:mb-4">
                        <div className="text-2xl font-bold text-primary">
                          {challenge.points}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          points
                        </div>
                      </div>
                      <Button asChild variant="outline">
                        <Link href={`/challenges/${challenge.id}`}>
                          View Solution
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-6">
          <div className="space-y-4">
            {filteredChallenges
              .filter((challenge) => challenge.status === "in-progress")
              .map((challenge) => (
                <Card key={challenge.id} className="overflow-hidden">
                  {/* Same card content as above, but for in-progress challenges only */}
                  <div className="flex flex-col md:flex-row">
                    <div className="flex-1 p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                        <div className="flex items-center space-x-2 mb-2 md:mb-0">
                          <Badge
                            variant={
                              challenge.difficulty === "Easy"
                                ? "outline"
                                : challenge.difficulty === "Medium"
                                ? "secondary"
                                : "default"
                            }
                          >
                            {challenge.difficulty}
                          </Badge>
                          <Badge variant="outline">{challenge.category}</Badge>
                        </div>
                        <div className="flex items-center text-yellow-500">
                          <Clock className="h-4 w-4 mr-1" />
                          <span className="text-sm">In Progress</span>
                          {challenge.progress && (
                            <span className="ml-2 text-sm font-medium">
                              {challenge.progress}%
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="font-medium text-lg">{challenge.title}</h3>
                      <p className="text-muted-foreground text-sm mt-1 mb-3">
                        {challenge.description}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {challenge.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Progress</span>
                          <span>{challenge.progress}%</span>
                        </div>
                        <Progress value={challenge.progress} className="h-2" />
                        <div className="text-sm text-muted-foreground">
                          Time spent so far: {challenge.timeSpent}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row md:flex-col justify-between items-center bg-muted/20 p-6 md:w-60">
                      <div className="text-center md:mb-4">
                        <div className="text-2xl font-bold text-primary">
                          {challenge.points}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          points
                        </div>
                      </div>
                      <Button asChild>
                        <Link href={`/challenges/${challenge.id}`}>
                          Continue
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="not-started" className="space-y-6">
          <div className="space-y-4">
            {filteredChallenges
              .filter((challenge) => challenge.status === "not-started")
              .map((challenge) => (
                <Card key={challenge.id} className="overflow-hidden">
                  {/* Same card content as above, but for not-started challenges only */}
                  <div className="flex flex-col md:flex-row">
                    <div className="flex-1 p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                        <div className="flex items-center space-x-2 mb-2 md:mb-0">
                          <Badge
                            variant={
                              challenge.difficulty === "Easy"
                                ? "outline"
                                : challenge.difficulty === "Medium"
                                ? "secondary"
                                : "default"
                            }
                          >
                            {challenge.difficulty}
                          </Badge>
                          <Badge variant="outline">{challenge.category}</Badge>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Code className="h-4 w-4 mr-1" />
                          <span className="text-sm">Not Started</span>
                        </div>
                      </div>

                      <h3 className="font-medium text-lg">{challenge.title}</h3>
                      <p className="text-muted-foreground text-sm mt-1 mb-3">
                        {challenge.description}
                      </p>

                      <div className="flex flex-wrap gap-1">
                        {challenge.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-row md:flex-col justify-between items-center bg-muted/20 p-6 md:w-60">
                      <div className="text-center md:mb-4">
                        <div className="text-2xl font-bold text-primary">
                          {challenge.points}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          points
                        </div>
                      </div>
                      <Button asChild>
                        <Link href={`/challenges/${challenge.id}`}>
                          Start Challenge
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
