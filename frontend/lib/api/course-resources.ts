import { _axios } from "../axios";

export interface CourseResource {
  id: string;
  title: string;
  description?: string;
  type: "file" | "link";
  file_name?: string;
  file_path?: string;
  file_url?: string;
  file_size?: number;
  file_type?: string;
  url?: string;
  created_at: number;
  updated_at: number;
}

export interface ResourceFormData {
  title: string;
  description?: string;
  type: "file" | "link";
  url?: string;
  id?: string | number;
  file?: File | null;
  fileName?: string;
}

/**
 * CourseResourceAPI - Provides methods for managing course resources
 */
export class CourseResourceAPI {
  /**
   * Get all resources for a course
   */
  static async getResources(
    courseId: string | number
  ): Promise<CourseResource[]> {
    try {
      const response = await _axios.get(`/courses/${courseId}/resources/`);
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching course resources:", error);
      throw error;
    }
  }

  /**
   * Add a new resource to a course
   */
  static async addResource(
    courseId: string | number,
    resourceData: ResourceFormData
  ): Promise<CourseResource> {
    try {
      // Handle file uploads with FormData
      if (resourceData.type === "file" && resourceData.file) {
        const formData = new FormData();
        formData.append("title", resourceData.title);
        formData.append("type", resourceData.type);

        if (resourceData.description) {
          formData.append("description", resourceData.description);
        }

        formData.append("file", resourceData.file);

        const response = await _axios.post(
          `/courses/${courseId}/resources/`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        return response.data.data;
      } else {
        // Handle link type resources with JSON
        const response = await _axios.post(
          `/courses/${courseId}/resources/`,
          resourceData
        );
        return response.data.data;
      }
    } catch (error) {
      console.error("Error adding course resource:", error);
      throw error;
    }
  }

  /**
   * Update an existing resource
   */
  static async updateResource(
    courseId: string | number,
    resourceId: string,
    resourceData: ResourceFormData
  ): Promise<CourseResource> {
    try {
      // Handle file uploads with FormData
      if (resourceData.type === "file" && resourceData.file) {
        const formData = new FormData();
        formData.append("title", resourceData.title);

        if (resourceData.description) {
          formData.append("description", resourceData.description);
        }

        formData.append("file", resourceData.file);

        const response = await _axios.put(
          `/courses/${courseId}/resources/${resourceId}/`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        return response.data.data;
      } else {
        // Handle link type resources with JSON
        const response = await _axios.put(
          `/courses/${courseId}/resources/${resourceId}/`,
          resourceData
        );
        return response.data.data;
      }
    } catch (error) {
      console.error("Error updating course resource:", error);
      throw error;
    }
  }

  /**
   * Delete a resource
   */
  static async deleteResource(
    courseId: string | number,
    resourceId: string
  ): Promise<boolean> {
    try {
      const response = await _axios.delete(
        `/courses/${courseId}/resources/${resourceId}/`
      );
      return response.data.status === "success";
    } catch (error) {
      console.error("Error deleting course resource:", error);
      throw error;
    }
  }

  /**
   * Process bulk resources from course creation/editing form
   * This method handles multiple resource additions/updates in one go
   */
  static async processBulkResources(
    courseId: any,
    resources: ResourceFormData[]
  ): Promise<CourseResource[]> {
    try {
      const results: CourseResource[] = [];

      for (const resource of resources) {
        if (
          !resource.title ||
          (resource.type === "link" && !resource.url) ||
          (resource.type === "file" && !resource.file && !resource.id)
        ) {
          continue;
        }

        // If resource has an id, update it
        if ("id" in resource) {
          const result = await this.updateResource(
            courseId,
            resource.id as string,
            resource
          );
          results.push(result);
        } else {
          // Otherwise add as new resource
          const result = await this.addResource(courseId, resource);
          results.push(result);
        }
      }

      return results;
    } catch (error) {
      console.error("Error processing bulk resources:", error);
      throw error;
    }
  }
}
