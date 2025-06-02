import { _axios as axios } from "../axios";

export interface LessonProgress {
  lesson_id: number;
  is_completed: boolean;
  course_progress: {
    total_lessons: number;
    completed_lessons: number;
    percent_complete: number;
  };
}

export interface CourseViewData {
  id: number;
  title: string;
  description: string;
  short_description?: string;
  instructor: {
    id: string;
    name: string;
    email: string;
    bio?: string;
    profile_picture?: string;
  };
  thumbnail?: string;
  price: number;
  level: string;
  category: string;
  language: string;
  rating: number;
  rating_count: number;
  is_published: boolean;
  is_featured: boolean;
  total_students: number;
  total_lessons: number;
  total_duration: string;
  total_duration_seconds: number;
  sections: Array<{
    id: number;
    title: string;
    order: number;
    lessons: Array<{
      id: number;
      title: string;
      type: string;
      duration: string;
      duration_seconds: number;
      is_published: boolean;
      content?: string;
      video_url?: string;
      order: number;
      preview: boolean;
    }>;
  }>;
  requirements: Array<{
    id: number;
    text: string;
    order: number;
  }>;
  objectives: Array<{
    id: number;
    text: string;
    order: number;
  }>;
  user_data: {
    is_instructor: boolean;
    is_enrolled: boolean;
    is_favorite: boolean;
    progress: {
      completed_lessons: number[];
      current_lesson: number | null;
      percent_complete: number;
    };
  };
  created_at: string;
  updated_at: string;
}

export interface LessonViewData {
  id: number;
  title: string;
  type: string;
  duration: string;
  duration_seconds: number;
  is_published: boolean;
  content?: string;
  video_url?: string;
  order: number;
  preview: boolean;
  position: {
    section_id: number;
    section_title: string;
    section_order: number;
    lesson_order: number;
  };
  next_lesson?: {
    id: number;
    title: string;
    section_id: number;
    section_title: string;
  };
  prev_lesson?: {
    id: number;
    title: string;
    section_id: number;
    section_title: string;
  };
  course: {
    id: number;
    title: string;
  };
}

const CourseViewer = {
  /**
   * Fetch detailed course data optimized for viewing, including video details
   */
  getCourseViewData: async (
    courseId: string | number
  ): Promise<CourseViewData> => {
    try {
      // First try the enhanced course viewing endpoint
      try {
        const response = await axios.get(`/courses/${courseId}/view/`);
        if (response.data.success) {
          return response.data.data;
        }
      } catch (error) {
        // If the enhanced endpoint fails, we'll fall back to the standard endpoint
        console.log(
          "Enhanced course view API unavailable, falling back to standard API"
        );
      }

      // Fallback to standard course detail endpoint
      const response = await axios.get(`/courses/${courseId}/`);

      if (response.data.success) {
        const courseData = response.data.data;

        return courseData;
      } else {
        throw new Error(response.data.message || "Failed to fetch course data");
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Error fetching course data"
      );
    }
  },

  /**
   * Get detailed data for a specific lesson
   */
  getLessonDetails: async (
    lessonId: string | number
  ): Promise<LessonViewData> => {
    try {
      try {
        // First try the enhanced lesson detail endpoint
        const response = await axios.get(`/lessons/${lessonId}/`);
        if (response.data.success) {
          return response.data.data;
        }
      } catch (error) {
        console.log("Enhanced lesson detail API unavailable");
      }

      // If we get here, we need to extract lesson details from course data
      // This is a fallback approach for when the lesson API isn't available
      // We'll find the course that contains this lesson

      // First, attempt to find the lesson in a course section
      const courses = await axios.get("/courses/");
      if (!courses.data.success) {
        throw new Error("Failed to retrieve courses");
      }

      // Search through all courses for the lesson
      const allCourses = courses.data.data;
      let foundLesson = null;
      let foundSection = null;
      let foundCourse = null;

      for (const course of allCourses) {
        for (const section of course.sections) {
          const lesson = section.lessons.find((l: any) => l.id == lessonId);
          if (lesson) {
            foundLesson = lesson;
            foundSection = section;
            foundCourse = course;
            break;
          }
        }
        if (foundLesson) break;
      }

      if (!foundLesson) {
        throw new Error("Lesson not found in any course");
      }

      // Create a minimal compatible LessonViewData object
      const minimalLessonData: LessonViewData = {
        id: foundLesson.id,
        title: foundLesson.title,
        type: foundLesson.type,
        duration: foundLesson.duration,
        duration_seconds: parseDurationToSeconds(foundLesson.duration),
        is_published: foundLesson.is_published,
        content: foundLesson.content,
        video_url: foundLesson.video_url,
        order: foundLesson.order,
        preview: foundLesson.preview || false,
        position: {
          section_id: foundSection.id,
          section_title: foundSection.title,
          section_order: foundSection.order,
          lesson_order: foundLesson.order,
        },
        course: {
          id: foundCourse.id,
          title: foundCourse.title,
        },
      };

      // Calculate next and previous lessons
      const allLessons = foundCourse.sections.flatMap((s: any) => s.lessons);
      const currentIndex = allLessons.findIndex(
        (l: any) => l.id === foundLesson.id
      );

      if (currentIndex > 0) {
        const prevL = allLessons[currentIndex - 1];
        const prevSection = foundCourse.sections.find((s: any) =>
          s.lessons.some((l: any) => l.id === prevL.id)
        );
        minimalLessonData.prev_lesson = {
          id: prevL.id,
          title: prevL.title,
          section_id: prevSection.id,
          section_title: prevSection.title,
        };
      }

      if (currentIndex < allLessons.length - 1) {
        const nextL = allLessons[currentIndex + 1];
        const nextSection = foundCourse.sections.find((s: any) =>
          s.lessons.some((l: any) => l.id === nextL.id)
        );
        minimalLessonData.next_lesson = {
          id: nextL.id,
          title: nextL.title,
          section_id: nextSection.id,
          section_title: nextSection.title,
        };
      }

      return minimalLessonData;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Error fetching lesson data"
      );
    }
  },

  /**
   * Mark a lesson as completed or not completed
   */
  markLessonProgress: async (
    lessonId: string | number,
    completed: boolean = true
  ): Promise<LessonProgress> => {
    try {
      // Try with the enhanced API endpoint first
      try {
        const response = await axios.post(`/lessons/${lessonId}/progress/`, {
          completed,
        });

        if (response.data.success) {
          // Validate response structure and provide defaults if fields are missing
          const progressData = response.data.data;
          return {
            lesson_id: Number(lessonId),
            is_completed: progressData.is_completed ?? completed,
            course_progress: {
              total_lessons: progressData.course_progress?.total_lessons ?? 0,
              completed_lessons:
                progressData.course_progress?.completed_lessons ?? 0,
              percent_complete:
                progressData.course_progress?.percent_complete ?? 0,
            },
          };
        }
      } catch (error) {
        console.log(
          "Enhanced lesson progress API unavailable, creating fallback response"
        );
      }

      // Provide a fallback response if the API endpoint is not available yet
      return {
        lesson_id: Number(lessonId),
        is_completed: completed,
        course_progress: {
          total_lessons: 0,
          completed_lessons: 0,
          percent_complete: 0,
        },
      };
    } catch (error: any) {
      console.error("Error updating lesson progress:", error);

      // Even in case of error, return a valid object structure to prevent frontend crashes
      return {
        lesson_id: Number(lessonId),
        is_completed: completed,
        course_progress: {
          total_lessons: 0,
          completed_lessons: 0,
          percent_complete: 0,
        },
      };
    }
  },

  /**
   * Add course to favorites
   */
  addToFavorites: async (courseId: string | number): Promise<boolean> => {
    try {
      const response = await axios.post(`/favorite-courses/`, {
        course_id: courseId,
      });
      return response.data.success;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Error adding course to favorites"
      );
    }
  },

  /**
   * Remove course from favorites
   */
  removeFromFavorites: async (courseId: string | number): Promise<boolean> => {
    try {
      const response = await axios.delete(`/favorite-courses/`, {
        data: { course_id: courseId },
      });
      return response.data.success;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Error removing course from favorites"
      );
    }
  },
};

// Utility function to parse duration string (MM:SS) to seconds
function parseDurationToSeconds(duration: string): number {
  if (!duration) return 0;

  try {
    const [minutes, seconds] = duration.split(":").map(Number);
    return minutes * 60 + seconds;
  } catch (e) {
    return 0;
  }
}

// Utility function to calculate total duration in seconds from course data
function calculateDurationInSeconds(courseData: any): number {
  let totalSeconds = 0;

  if (!courseData.sections) return 0;

  courseData.sections.forEach((section: any) => {
    if (!section.lessons) return;

    section.lessons.forEach((lesson: any) => {
      totalSeconds += parseDurationToSeconds(lesson.duration || "00:00");
    });
  });

  return totalSeconds;
}

export default CourseViewer;
