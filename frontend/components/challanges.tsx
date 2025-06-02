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
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code,
  Play,
  Terminal,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ChallengePage({ challenge }: any) {
  // Determine default code template based on challenge category
  const defaultCode =
    challenge.category === "JavaScript"
      ? `// Write your solution here\nfunction solution() {\n  // ...\n}`
      : challenge.starterCode ||
        `<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>My Simple Webpage</title>\n  <style>\n    /* Add your CSS here */\n  </style>\n</head>\n<body>\n  <!-- Add your HTML here -->\n</body>\n</html>`;

  const [code, setCode] = useState(defaultCode);
  const [output, setOutput] = useState("");
  const [testResults, setTestResults] = useState<any>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes in seconds
  const [activeTab, setActiveTab] = useState("editor");

  const formatTime = (seconds: any) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const validateHTMLChallenge = (code: string, testCase: any) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(code, "text/html");

    const validations: any = {
      "Header exists": () => {
        const header = doc.querySelector("header");
        return {
          passed: !!header,
          message: header ? "Test passed" : "Missing <header> element",
        };
      },
      "Main exists": () => {
        const main = doc.querySelector("main");
        return {
          passed: !!main,
          message: main ? "Test passed" : "Missing <main> element",
        };
      },
      "Footer exists": () => {
        const footer = doc.querySelector("footer");
        return {
          passed: !!footer,
          message: footer ? "Test passed" : "Missing <footer> element",
        };
      },
      "Semantic HTML": () => {
        const semantic =
          doc.querySelectorAll(
            "header, nav, main, article, section, aside, footer"
          ).length > 0;
        return {
          passed: semantic,
          message: semantic ? "Test passed" : "Missing semantic HTML elements",
        };
      },
      "Navigation menu": () => {
        const nav = doc.querySelector("nav");
        const links = nav?.querySelectorAll("a");
        const hasEnoughLinks = links && links.length >= 3;

        if (!nav) {
          return { passed: false, message: "Missing <nav> element" };
        }
        if (!hasEnoughLinks) {
          return {
            passed: false,
            message: `Navigation needs at least 3 links, found ${
              links?.length || 0
            }`,
          };
        }
        return { passed: true, message: "Test passed" };
      },
      "Main content": () => {
        const main = doc.querySelector("main");
        const heading = main?.querySelector("h1, h2, h3, h4, h5, h6");
        const paragraph = main?.querySelector("p");
        const image = main?.querySelector("img");

        if (!main) {
          return { passed: false, message: "Missing <main> element" };
        }
        if (!heading) {
          return {
            passed: false,
            message: "Main section missing a heading element",
          };
        }
        if (!paragraph) {
          return {
            passed: false,
            message: "Main section missing a paragraph element",
          };
        }
        if (!image) {
          return {
            passed: false,
            message: "Main section missing an image element",
          };
        }

        return { passed: true, message: "Test passed" };
      },
      "CSS styling": () => {
        const styleElements = doc.querySelectorAll("style");
        const styleLinks = doc.querySelectorAll('link[rel="stylesheet"]');
        const inlineStyles = doc.querySelectorAll("[style]");

        const hasStyles =
          styleElements.length > 0 ||
          styleLinks.length > 0 ||
          inlineStyles.length > 0;

        // Check if the style elements have content
        let hasStyleContent = false;
        styleElements.forEach((style) => {
          if (
            style.textContent &&
            style.textContent.replace(/\/\*[\s\S]*?\*\/|[\s]/g, "").length > 0
          ) {
            hasStyleContent = true;
          }
        });

        if (!hasStyles) {
          return { passed: false, message: "No CSS styling found" };
        }
        if (styleElements.length > 0 && !hasStyleContent) {
          return {
            passed: false,
            message: "Style element exists but no CSS rules defined",
          };
        }

        return { passed: true, message: "Test passed" };
      },
      "Responsive design": () => {
        const hasViewport = !!doc.querySelector('meta[name="viewport"]');
        const styles = Array.from(doc.querySelectorAll("style"))
          .map((s) => s.textContent)
          .join(" ");

        const hasMediaQueries = styles.includes("@media");
        const hasRelativeUnits =
          styles.includes("em") ||
          styles.includes("rem") ||
          styles.includes("%") ||
          styles.includes("vw") ||
          styles.includes("vh") ||
          styles.includes("fr");

        if (!hasViewport) {
          return {
            passed: false,
            message: "Missing viewport meta tag for responsive design",
          };
        }
        if (!hasMediaQueries && !hasRelativeUnits) {
          return {
            passed: false,
            message:
              "No responsive techniques found (media queries or relative units)",
          };
        }

        return { passed: true, message: "Test passed" };
      },
    };

    if (validations[testCase.name]) {
      return validations[testCase.name]();
    }

    // For test cases without specific validation
    return {
      passed: false,
      message: "Validation not implemented for this test",
    };
  };

  // --- JS Challenge Test Runner ---
  const getUserSolution = (code: string) => {
    try {
      // Wrap code and return the solution function
      // eslint-disable-next-line no-new-func
      const fn = new Function(
        `${code}; return typeof solution === 'function' ? solution : null;`
      );
      return fn();
    } catch {
      return null;
    }
  };

  const validateJSChallenge = (code: string, testCase: any) => {
    // First check for UI elements like inputs and buttons
    if (
      testCase.name.includes("Input exists") ||
      testCase.name.includes("Inputs exist")
    ) {
      // Simple validation for inputs - just check if it's mentioned in the code
      return {
        passed: code.includes("<input"),
        message: code.includes("<input")
          ? "Test passed"
          : "No input element found",
      };
    }

    if (testCase.name.includes("Button exists")) {
      // Simple validation for buttons - just check if it's mentioned in the code
      return {
        passed: code.includes("<button") || code.includes('type="button"'),
        message:
          code.includes("<button") || code.includes('type="button"')
            ? "Test passed"
            : "No button element found",
      };
    }

    // For functional tests, check the solution function
    const solution = getUserSolution(code);
    if (!solution && testCase.name.includes("correct")) {
      return { passed: false, message: "No function named 'solution' found" };
    }

    try {
      switch (testCase.name) {
        case "Sum correct":
          return solution([1, 2, 3]) === 6
            ? { passed: true, message: "Test passed" }
            : { passed: false, message: "Expected solution([1,2,3]) to be 6" };
        case "Reverse correct":
          return solution("hello") === "olleh"
            ? { passed: true, message: "Test passed" }
            : {
                passed: false,
                message: "Expected solution('hello') to be 'olleh'",
              };
        case "Check correct":
          if (solution(4) !== "even")
            return {
              passed: false,
              message: "Expected solution(4) to be 'even'",
            };
          if (solution(5) !== "odd")
            return {
              passed: false,
              message: "Expected solution(5) to be 'odd'",
            };
          return { passed: true, message: "Test passed" };
        case "Max correct":
          return solution([1, 9, 3]) === 9
            ? { passed: true, message: "Test passed" }
            : { passed: false, message: "Expected solution([1,9,3]) to be 9" };
        case "Count correct":
          return solution("hello") === 2
            ? { passed: true, message: "Test passed" }
            : { passed: false, message: "Expected solution('hello') to be 2" };
        default:
          return { passed: true, message: "Manual check required" };
      }
    } catch (e: any) {
      return { passed: false, message: e.message };
    }
  };

  const runCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      let results;
      if (challenge.category === "JavaScript") {
        results = challenge.testCases.map((testCase: any) =>
          validateJSChallenge(code, testCase)
        );
      } else if (challenge.category === "HTML & CSS") {
        results = challenge.testCases.map((testCase: any) =>
          validateHTMLChallenge(code, testCase)
        );
      } else {
        results = challenge.testCases.map(() => ({
          passed: false,
          message: "Validation not implemented for this challenge type",
        }));
      }
      setTestResults(results);
      setIsRunning(false);
    }, 800);
  };

  const passedTests = testResults.filter((test: any) => test.passed).length;
  const totalTests = challenge.testCases.length;
  // Use challenge.points or fallback for score calculation
  const score = Math.round(
    (passedTests / totalTests) *
      (challenge.points || challenge.completions || 0)
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/challenges" className="hover:text-primary">
            Challenges
          </Link>
          <span>/</span>
          <span className="text-foreground">{challenge.title}</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold">
                {challenge.title}
              </h1>
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
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <span>{challenge.category}</span>
              <span className="mx-2">•</span>
              <span>{challenge.points} points</span>
              <span className="mx-2">•</span>
              <span className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                {challenge.timeLimit}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm font-medium flex items-center">
              Time Remaining:
              <span
                className={`ml-2 ${
                  timeRemaining < 300 ? "text-destructive" : ""
                }`}
              >
                {formatTime(timeRemaining)}
              </span>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/challenges">Exit Challenge</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
                <CardDescription>
                  Follow these instructions to complete the challenge
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: challenge.instructions }}
                />
              </CardContent>
              <CardFooter>
                <Button
                  onClick={runCode}
                  disabled={isRunning}
                  className="w-full"
                >
                  {isRunning ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run Tests
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            {testResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Test Results</CardTitle>
                  <CardDescription>
                    {passedTests} of {totalTests} tests passed ({score} points)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {challenge.testCases.map((test: any, index: any) => (
                      <div
                        key={index}
                        className={`p-3 rounded-md ${
                          testResults[index]?.passed
                            ? "bg-green-500/10 border border-green-500/20"
                            : "bg-destructive/10 border border-destructive/20"
                        }`}
                      >
                        <div className="flex items-start">
                          {testResults[index]?.passed ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-destructive mr-2 flex-shrink-0" />
                          )}
                          <div>
                            <h4 className="font-medium text-sm">{test.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {test.description}
                            </p>
                            {testResults[index] && (
                              <p className="text-xs mt-1">
                                {testResults[index].message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant={passedTests === totalTests ? "default" : "outline"}
                    className="w-full"
                    asChild
                  >
                    <Link href="/challenges/tracker">
                      {passedTests === totalTests
                        ? "Complete Challenge"
                        : "Save Progress"}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>

          <div className="lg:col-span-2 space-y-4">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="editor" className="flex items-center">
                  <Code className="mr-2 h-4 w-4" />
                  Editor
                </TabsTrigger>
                <TabsTrigger value="output" className="flex items-center">
                  <Terminal className="mr-2 h-4 w-4" />
                  Output
                </TabsTrigger>
              </TabsList>
              <TabsContent value="editor" className="mt-0">
                <Card className="border-t-0 rounded-tl-none rounded-tr-none">
                  <CardContent className="p-0">
                    <div className="relative h-[600px] font-mono text-sm">
                      <div className="absolute inset-0 p-4 bg-muted/50 overflow-auto code-editor">
                        <textarea
                          className="w-full h-full bg-transparent resize-none focus:outline-none"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          spellCheck="false"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              {/* For JS, do not render output/iframe, just show test results below */}
            </Tabs>

            <div className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/challenges">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to Challenges
                </Link>
              </Button>
              <Button onClick={runCode} disabled={isRunning}>
                {isRunning ? "Running..." : "Run Code"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
