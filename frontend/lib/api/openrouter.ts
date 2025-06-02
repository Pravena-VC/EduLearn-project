import OpenAI from "openai";

export interface LearningPathData {
  assessment: {
    level: string;
    goals: string;
  };
  learningPath: Array<{
    stage: string;
    description: string;
    duration: string;
    milestones: Array<{
      name: string;
      description: string;
    }>;
    resources: Array<{
      name: string;
      type: string;
      url?: string;
      description: string;
    }>;
    projects: Array<{
      name: string;
      description: string;
    }>;
  }>;
  timeline: {
    totalDuration: string;
    breakdown: string;
  };
  tips: string[];
}

export const MODELS = {
  CLAUDE_INSTANT: "anthropic/claude-instant-v1",
  MISTRAL_7B: "mistralai/mistral-7b-instruct:free",
  LLAMA_3_8B: "meta-llama/llama-3-8b-instruct",
};

class OpenRouterApiService {
  private client: OpenAI | null = null;

  constructor() {
    try {
      this.client = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        dangerouslyAllowBrowser: true,
        apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY as string,
        defaultHeaders: {
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
          "X-Title": "EduLearn Platform",
        },
      });
    } catch (error) {
      console.error("Failed to initialize OpenRouter API:", error);
    }
  }

  async generateLearningPath(
    userResponses: Record<string, string>
  ): Promise<LearningPathData> {
    if (!this.client) {
      throw new Error("OpenRouter client is not initialized");
    }

    try {
      const prompt = this.createPrompt(userResponses);

      const completion = await this.client.chat.completions.create({
        model: MODELS.MISTRAL_7B,
        messages: [
          {
            role: "system",
            content: `You are a professional education consultant at EduLearn Platform helping to create personalized learning paths.
            Create detailed, step-by-step learning roadmaps that are practical and actionable.
            
            IMPORTANT: You must respond with a valid JSON object with the following structure:
            {
              "assessment": {
                "level": "string - Brief assessment of current knowledge level",
                "goals": "string - Analysis of learning goals"
              },
              "learningPath": [
                {
                  "stage": "string - Name of this learning stage",
                  "description": "string - Description of this stage",
                  "duration": "string - Estimated time to complete this stage",
                  "milestones": [
                    {
                      "name": "string - Name of milestone",
                      "description": "string - What this milestone represents"
                    }
                  ],
                  "resources": [
                    {
                      "name": "string - Resource name",
                      "type": "string - book, course, video, website, etc.",
                      "url": "string - optional URL if available",
                      "description": "string - Why this resource is valuable"
                    }
                  ],
                  "projects": [
                    {
                      "name": "string - Project name", 
                      "description": "string - Project description"
                    }
                  ]
                }
              ],
              "timeline": {
                "totalDuration": "string - Overall estimated duration",
                "breakdown": "string - Brief breakdown of time allocation"
              },
              "tips": [
                "string - Learning tip 1",
                "string - Learning tip 2"
              ]
            }
            
            Make sure your response is valid JSON. Do not include any markdown formatting or explanatory text outside the JSON structure.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });
//@ts-ignore
      return completion.choices[0].message.content;
    } catch (error) {
      console.error("Error generating learning path:", error);
      throw error;
    }
  }

  private createPrompt(userResponses: Record<string, string>): string {
    const { goal, background, timeCommitment, preferredStyle } = userResponses;

    // Convert background value to more descriptive text if it's one of the select options
    let backgroundDescription = background;
    if (background === "beginner") {
      backgroundDescription = "Beginner with no prior knowledge in this area";
    } else if (background === "novice") {
      backgroundDescription =
        "Novice with understanding of some basic concepts";
    } else if (background === "intermediate") {
      backgroundDescription =
        "Intermediate with familiarity of fundamental concepts";
    } else if (background === "advanced") {
      backgroundDescription =
        "Advanced with solid understanding of most concepts";
    } else if (background === "expert") {
      backgroundDescription =
        "Expert with deep knowledge, seeking specialized knowledge";
    }

    // Convert learning style to more descriptive text
    let learningStyleDescription = preferredStyle;
    if (preferredStyle === "visual") {
      learningStyleDescription =
        "Visual learning through videos, diagrams, and infographics";
    } else if (preferredStyle === "reading") {
      learningStyleDescription =
        "Reading-based learning through articles, books, and documentation";
    } else if (preferredStyle === "interactive") {
      learningStyleDescription =
        "Interactive learning through exercises, quizzes, and coding practice";
    } else if (preferredStyle === "project-based") {
      learningStyleDescription =
        "Project-based learning through building real applications";
    } else if (preferredStyle === "social") {
      learningStyleDescription =
        "Social learning through group discussions and pair programming";
    }

    return `Create a personalized learning path based on the following information:
      
      Learning Goal: ${goal}
      Current Knowledge/Background: ${backgroundDescription}
      Time Commitment: ${timeCommitment}
      Learning Style Preference: ${learningStyleDescription}
      
      Please provide a comprehensive and structured learning path that includes:
      1. A brief assessment of the student's current level and learning goals
      2. Clear milestones and progression steps with difficulty levels
      3. Specific resources (courses, books, tutorials, websites) with brief descriptions
      4. Practice exercises and projects to apply knowledge
      5. Estimated timeline based on the given time commitment
      6. Tips for successful learning based on their preferred learning style
      5. Ways to track progress and validate learning
    `;
  }
}

export const openRouterService = new OpenRouterApiService();
