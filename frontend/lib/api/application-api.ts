import { _axios as axios } from "@/lib/axios";

export interface CourseApplication {
  id: string;
  course: {
    id: number;
    title: string;
    thumbnail?: string;
  };
  status: "pending" | "approved" | "rejected";
  message?: string;
  created_at: string;
  updated_at: string;
}

export interface InstructorApplicationView extends CourseApplication {
  student: {
    id: number;
    name: string;
    email: string;
  };
}

// Create a new application for a course
export const applyToCourse = async (courseId: number, message: string = "") => {
  const response = await axios.post("/applications/", {
    course_id: courseId,
    message,
  });
  return response.data;
};

// Get all applications for the current user (student or instructor)
export const getApplications = async () => {
  const response = await axios.get("/applications/");
  return response.data;
};

// Cancel application (for students)
export const cancelApplication = async (applicationId: string) => {
  const response = await axios.delete(`/applications/${applicationId}/`);
  return response.data;
};

// Update application status (for instructors)
export const updateApplicationStatus = async (
  applicationId: string,
  status: "approved" | "rejected"
) => {
  const response = await axios.put(`/applications/${applicationId}/`, {
    status,
  });
  return response.data;
};
