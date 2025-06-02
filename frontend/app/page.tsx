import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, BookOpen, Code, Star, Trophy, Users } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const featuredCourses = [
    {
      id: 1,
      title: "Complete Web Development Bootcamp",
      description: "Learn HTML, CSS, JavaScript, React, Node.js and more",
      image: "/images/code1.jpg",
      instructor: "Jane Smith",
      rating: 4.8,
      students: 12453,
      level: "Beginner",
      category: "Web Development",
    },
    {
      id: 2,
      title: "Advanced Python Programming",
      description:
        "Master Python with advanced concepts and real-world projects",
      image: "/images/code2.jpg",

      instructor: "John Doe",
      rating: 4.9,
      students: 8765,
      level: "Advanced",
      category: "Programming",
    },
    {
      id: 3,
      title: "Data Science Fundamentals",
      description: "Learn data analysis, visualization, and machine learning",
      image: "/images/code3.jpg",

      instructor: "Alex Johnson",
      rating: 4.7,
      students: 9876,
      level: "Intermediate",
      category: "Data Science",
    },
  ];

  const featuredChallenges = [
    {
      id: 1,
      title: "Algorithmic Problem Solving",
      description: "Solve complex algorithmic problems and optimize your code",
      difficulty: "Hard",
      category: "Algorithms",
      completions: 5432,
    },
    {
      id: 2,
      title: "Frontend Coding Challenges",
      description:
        "Build responsive UI components with HTML, CSS, and JavaScript",
      difficulty: "Medium",
      category: "Web Development",
      completions: 7654,
    },
    {
      id: 3,
      title: "Database Query Optimization",
      description: "Optimize SQL queries for better performance",
      difficulty: "Medium",
      category: "Databases",
      completions: 4321,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Learn, Code, and Grow with EduLearn
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Master new skills with our interactive courses and coding
                  challenges. Join thousands of learners on their journey to
                  success.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" asChild>
                  <Link href="/courses">Explore Courses</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/challenges">Try Challenges</Link>
                </Button>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>50K+ Students</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>500+ Courses</span>
                </div>
                <div className="flex items-center gap-1">
                  <Code className="h-4 w-4" />
                  <span>1000+ Challenges</span>
                </div>
              </div>
            </div>
            <div className="mx-auto lg:mx-0 relative">
              <div className="relative rounded-lg overflow-hidden shadow-xl">
                <img
                  src="/images/hero.jpg"
                  alt="EduLearn Platform"
                  width={600}
                  height={500}
                  className="object-cover w-full"
                />
              </div>

              <div className="absolute -top-6 -right-6 bg-background rounded-lg shadow-lg p-4">
                <div className="text-sm font-medium">AI Recommendations</div>
                <div className="flex items-center mt-2">
                  <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-sm">Personalized for you</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Content Section */}
      <section className="w-full py-12 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Featured Content
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Discover our top-rated courses and challenges
              </p>
            </div>
          </div>

          <Tabs defaultValue="courses" className="mt-12">
            <div className="flex justify-center mb-8">
              <TabsList>
                <TabsTrigger value="courses">Courses</TabsTrigger>
                <TabsTrigger value="challenges">Challenges</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="courses" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredCourses.map((course) => (
                  <Card
                    key={course.id}
                    className="overflow-hidden transition-all hover:shadow-lg"
                  >
                    <div className="aspect-video relative">
                      <img
                        src={course.image || "/placeholder.svg"}
                        alt={course.title}
                        className="object-cover w-full h-full"
                      />
                      <Badge className="absolute top-2 right-2">
                        {course.level}
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-1">
                        {course.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-2 mb-4">
                        {course.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="font-medium">
                            {course.instructor}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                          <span className="text-sm font-medium">
                            {course.rating}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">
                            ({course.students.toLocaleString()})
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href={`/courses/${course.id}`}>View Course</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              <div className="flex justify-center">
                <Button variant="outline" asChild>
                  <Link href="/courses" className="flex items-center">
                    View All Courses <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="challenges" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredChallenges.map((challenge) => (
                  <Card
                    key={challenge.id}
                    className="overflow-hidden transition-all hover:shadow-lg"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="line-clamp-1">
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
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-2 mb-4">
                        {challenge.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{challenge.category}</Badge>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span className="text-sm">
                            {challenge.completions.toLocaleString()} completions
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href={`/challenges/${challenge.id}`}>
                          Start Challenge
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              <div className="flex justify-center">
                <Button variant="outline" asChild>
                  <Link href="/challenges" className="flex items-center">
                    View All Challenges <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 bg-muted">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Personalized Learning with AI
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Our AI-powered recommendation system analyzes your learning
                  patterns and suggests courses and challenges tailored to your
                  goals and skill level.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5 bg-primary/10 p-1.5 rounded-full text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M12 2v4" />
                      <path d="M12 18v4" />
                      <path d="M4.93 4.93l2.83 2.83" />
                      <path d="M16.24 16.24l2.83 2.83" />
                      <path d="M2 12h4" />
                      <path d="M18 12h4" />
                      <path d="M4.93 19.07l2.83-2.83" />
                      <path d="M16.24 7.76l2.83-2.83" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Smart Recommendations</h3>
                    <p className="text-sm text-muted-foreground">
                      Get course suggestions based on your interests and
                      learning history
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5 bg-primary/10 p-1.5 rounded-full text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" />
                      <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Personalized Learning Path</h3>
                    <p className="text-sm text-muted-foreground">
                      Follow a customized curriculum designed for your career
                      goals
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5 bg-primary/10 p-1.5 rounded-full text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M2 12h10" />
                      <path d="M9 4v16" />
                      <path d="M14 9l3 3-3 3" />
                      <path d="M17 17h5" />
                      <path d="M22 12h-5" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Adaptive Difficulty</h3>
                    <p className="text-sm text-muted-foreground">
                      Challenges that adapt to your skill level for optimal
                      learning
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mx-auto lg:mx-0 relative">
              <div className="relative rounded-lg overflow-hidden shadow-xl">
                <img
                  src="/images/codeai.jpg"
                  alt="AI Recommendations"
                  width={600}
                  height={500}
                  className="object-cover w-full"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-background rounded-lg shadow-lg p-4 w-64">
                <div className="text-sm font-medium mb-2">
                  Learning makes you smarter
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-xs">
                      Web Development Fundamentals
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                    <span className="text-xs">
                      JavaScript Advanced Concepts
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-muted mr-2"></div>
                    <span className="text-xs">React Framework Mastery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Ready to Start Your Learning Journey?
              </h2>
              <p className="max-w-[600px] md:text-xl">
                Join thousands of students and professionals who are advancing
                their careers with EduLearn.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/register">Sign Up for Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
