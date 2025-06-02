import { _axios as axios } from "../axios";

export interface VideoUploadResponse {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  duration: string;
}

export interface ThumbnailUploadResponse {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
}

export interface Lesson {
  id: string;
  title: string;
  type: "video" | "article";
  content?: string;
  video_url?: string;
  video_duration?: string;
  thumbnail_url?: string;
  is_published: boolean;
  order: number;
}

export interface Section {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  instructor: string;
  instructor_name: string;
  category: string;
  category_name: string;
  thumbnail?: string;
  level: string;
  price: number;
  requirements: string[];
  objectives: string[];
  tags: string[];
  is_published: boolean;
  is_featured: boolean;
  sections: Section[];
}

const CourseService = {
  getAllCourses: async (): Promise<Course[]> => {
    const response = await axios.get("/api/courses/");
    return response.data;
  },

  getCourseById: async (courseId: string): Promise<Course> => {
    const response = await axios.get(`/api/courses/${courseId}/`);
    return response.data;
  },

  createCourse: async (courseData: Partial<Course>): Promise<Course> => {
    const response = await axios.post("/api/courses/", courseData);
    return response.data;
  },

  updateCourse: async (
    courseId: string,
    courseData: Partial<Course>
  ): Promise<Course> => {
    const response = await axios.patch(`/api/courses/${courseId}/`, courseData);
    return response.data;
  },

  deleteCourse: async (courseId: string): Promise<void> => {
    await axios.delete(`/api/courses/${courseId}/`);
  },

  // Section Operations
  createSection: async (
    courseId: string,
    sectionData: Partial<Section>
  ): Promise<Section> => {
    const payload = {
      ...sectionData,
      course_id: courseId,
    };
    const response = await axios.post("/api/sections/", payload);
    return response.data;
  },

  updateSection: async (
    sectionId: string,
    sectionData: Partial<Section>
  ): Promise<Section> => {
    const response = await axios.patch(
      `/api/sections/${sectionId}/`,
      sectionData
    );
    return response.data;
  },

  deleteSection: async (sectionId: string): Promise<void> => {
    await axios.delete(`/api/sections/${sectionId}/`);
  },

  createLesson: async (
    sectionId: string,
    lessonData: Partial<Lesson>
  ): Promise<Lesson> => {
    const payload = {
      ...lessonData,
      section_id: sectionId,
    };
    const response = await axios.post("/api/lessons/", payload);
    return response.data;
  },

  updateLesson: async (
    lessonId: string,
    lessonData: Partial<Lesson>
  ): Promise<Lesson> => {
    const response = await axios.patch(`/api/lessons/${lessonId}/`, lessonData);
    return response.data;
  },

  deleteLesson: async (lessonId: string): Promise<void> => {
    await axios.delete(`/api/lessons/${lessonId}/`);
  },

  uploadVideo: async (
    file: File,
    lessonId?: string,
    courseId?: string,
    duration?: string
  ): Promise<VideoUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    if (lessonId) {
      formData.append("lesson_id", lessonId);
    } else if (courseId) {
      formData.append("course_id", courseId);
    }

    if (duration) {
      formData.append("duration", duration);
    }

    const response = await axios.post("/api/upload/video/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  uploadThumbnail: async (
    file: File,
    lessonId?: string,
    courseId?: string
  ): Promise<ThumbnailUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    if (lessonId) {
      formData.append("lesson_id", lessonId);
    } else if (courseId) {
      formData.append("course_id", courseId);
    }

    const response = await axios.post("/api/upload/thumbnail/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Course Status Operations
  togglePublishStatus: async (courseId: string): Promise<any> => {
    const response = await axios.post(
      `/api/courses/${courseId}/set_published/`
    );
    return response.data;
  },

  toggleFeaturedStatus: async (courseId: string): Promise<any> => {
    const response = await axios.post(`/api/courses/${courseId}/set_featured/`);
    return response.data;
  },
};

export default CourseService;
