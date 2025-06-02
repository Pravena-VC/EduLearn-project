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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { challenges } from "@/lib/challenges";
import { Clock, Code, FileCode, Star } from "lucide-react";
import Link from "next/link";

export default function ChallengesPage() {
  const htmlChallenges = challenges.filter((c) => c.category === "HTML & CSS");
  const jsChallenges = challenges.filter((c) => c.category === "JavaScript");

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Coding Challenges</h1>
            <p className="text-muted-foreground mt-1">
              Test your skills with these interactive coding challenges
            </p>
          </div>
        </div>
        <Tabs defaultValue="html" className="w-full">
          <TabsList className="w-full max-w-md mx-auto">
            <TabsTrigger value="html" className="flex items-center">
              <FileCode className="mr-2 h-4 w-4" />
              HTML & CSS
            </TabsTrigger>
            <TabsTrigger value="javascript" className="flex items-center">
              <Code className="mr-2 h-4 w-4" />
              JavaScript
            </TabsTrigger>
            <TabsTrigger value="react" className="flex items-center">
              <Star className="mr-2 h-4 w-4" />
              React
            </TabsTrigger>
          </TabsList>
          <TabsContent value="html" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {htmlChallenges.map((challenge) => (
                <Card key={challenge.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">
                        {challenge.title}
                      </CardTitle>
                      <Badge
                        variant={
                          challenge.difficulty === "Easy"
                            ? "outline"
                            : challenge.difficulty === "Medium"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {challenge.difficulty}
                      </Badge>
                    </div>
                    <CardDescription>{challenge.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="flex flex-col space-y-2 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>{challenge.estimatedTime}</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Star className="mr-2 h-4 w-4" />
                        <span>{challenge.completions} points</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" asChild>
                      <Link href={`/challenges/${challenge.id}`}>
                        Start Challenge
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="javascript" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jsChallenges.map((challenge) => (
                <Card key={challenge.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">
                        {challenge.title}
                      </CardTitle>
                      <Badge
                        variant={
                          challenge.difficulty === "Easy"
                            ? "outline"
                            : challenge.difficulty === "Medium"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {challenge.difficulty}
                      </Badge>
                    </div>
                    <CardDescription>{challenge.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="flex flex-col space-y-2 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>{challenge.estimatedTime}</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Star className="mr-2 h-4 w-4" />
                        <span>{challenge.completions} points</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      asChild
                      onClick={() => {
                        console.log("Challenge started", challenge);
                      }}
                    >
                      <Link href={`/challenges/${challenge.id}`}>
                        Start Challenge
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="react" className="mt-6">
            <div className="flex items-center justify-center h-40 border rounded-md">
              <p className="text-muted-foreground">
                React challenges coming soon!
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
