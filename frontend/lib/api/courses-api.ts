import { _axios as axios } from "@/lib/axios";

// Types for our courses API
export interface CourseInstructor {
  id: string;
  name: string;
}

export interface CoursePreview {
  id: number;
  title: string;
  short_description: string;
  description: string;
  instructor: CourseInstructor;
  thumbnail: string | null;
  price: number;
  level: string;
  category: string;
  language: string;
  rating: number;
  rating_count: number;
  is_featured: boolean;
  total_students: number;
  total_lessons: number;
  total_duration: string;
  created_at: string;
  updated_at: string;
}

export interface PaginationInfo {
  total_pages: number;
  total_courses: number;
  current_page: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface CoursesFilters {
  categories: string[];
  levels: string[];
}

export interface CourseResponse {
  success: boolean;
  data: CoursePreview[];
  pagination: PaginationInfo;
  filters: CoursesFilters;
}

export interface CourseFilters {
  category?: string;
  level?: string;
  search?: string;
  featured?: boolean;
  page?: number;
  page_size?: number;
}

export const getPublicCourses = async (
  filters: CourseFilters = {}
): Promise<CourseResponse> => {
  const params = new URLSearchParams();

  if (filters.category) params.append("category", filters.category);
  if (filters.level) params.append("level", filters.level);
  if (filters.search) params.append("search", filters.search);
  if (filters.featured !== undefined)
    params.append("featured", filters.featured.toString());
  if (filters.page) params.append("page", filters.page.toString());
  if (filters.page_size)
    params.append("page_size", filters.page_size.toString());

  const response = await axios.get(`/public/courses/?${params.toString()}`);
  return response.data;
};

// Function to get course details by ID
export const getCourseById = async (
  courseId: string | number
): Promise<any> => {
  const response = await axios.get(`/api/courses/${courseId}/`);
  return response.data;
};

export async function createCourse(courseData: FormData) {
  try {
    if (courseData.has("resources")) {
      const resourcesJson = courseData.get("resources") as string;
      const resources = JSON.parse(resourcesJson);

      courseData.delete("resources");

      courseData.append("resources", JSON.stringify(resources));

      resources.forEach((resource: any) => {
        if (resource.file instanceof File) {
          courseData.append(`file_${resource.id}`, resource.file);
        }
      });
    }

    const response = await axios.post("/courses/", courseData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to create course:", error);
    throw new Error(error.response?.data?.detail || "Failed to create course");
  }
}

export async function updateCourse(courseId: number, courseData: FormData) {
  try {
    // Handle resources separately to properly append files
    if (courseData.has("resources")) {
      const resourcesJson = courseData.get("resources") as string;
      const resources = JSON.parse(resourcesJson);

      // Remove the original resources field
      courseData.delete("resources");

      // Add resources back as a JSON string
      courseData.append("resources", JSON.stringify(resources));

      // Add files with appropriate keys
      resources.forEach((resource: any) => {
        if (resource.file instanceof File) {
          courseData.append(`file_${resource.id}`, resource.file);
        }
      });
    }

    const response = await axios.put(`/courses/${courseId}/`, courseData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to update course:", error);
    throw new Error(error.response?.data?.detail || "Failed to update course");
  }
}
