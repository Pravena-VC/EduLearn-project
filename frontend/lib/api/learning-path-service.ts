import { _axios as axiosInstance } from "@/lib/axios";

export interface LearningPathSummary {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  learning_goal: string;
  is_favorite: boolean;
}

export interface LearningPathDetail extends LearningPathSummary {
  background: string;
  time_commitment: string;
  preferred_style: string;
  path_data: any;
}

export const learningPathService = {
  getAllPaths: async (): Promise<LearningPathSummary[]> => {
    const response = await axiosInstance.get("/learning-paths/");
    return response.data.data;
  },

  getPath: async (pathId: number): Promise<LearningPathDetail> => {
    const response = await axiosInstance.get(`/learning-paths/${pathId}/`);
    return response.data.data;
  },

  createPath: async (data: {
    path_data: string;
    learning_goal?: string;
    background?: string;
    time_commitment?: string;
    preferred_style?: string;
    title?: string;
  }): Promise<LearningPathSummary> => {
    const response = await axiosInstance.post("/learning-paths/", data);
    return response.data.data;
  },

  updatePath: async (
    pathId: number,
    data: { title?: string; is_favorite?: boolean }
  ): Promise<LearningPathSummary> => {
    const response = await axiosInstance.put(
      `/api/learning-paths/${pathId}/`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete a learning path
   */
  deletePath: async (pathId: number): Promise<void> => {
    await axiosInstance.delete(`/learning-paths/${pathId}/`);
  },
};
