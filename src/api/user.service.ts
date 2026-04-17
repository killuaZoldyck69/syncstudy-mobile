import { apiClient } from "./client";

// 1. Define strict types for the payload so TypeScript catches errors instantly
export interface UpdateProfilePayload {
  name: string;
  image?: string;
  university_name?: string;
  department?: string;
  student_id?: string;
}

export const userService = {
  /**
   * Updates the user's profile data via the custom backend endpoint.
   */
  updateProfile: async (payload: UpdateProfilePayload) => {
    try {
      // Assuming your custom endpoint uses PUT. Change to POST or PATCH if needed.
      const response = await apiClient<any>("/users/profile", {
        method: "PATCH",
        data: payload,
      });
      return { data: response, error: null };
    } catch (error: any) {
      console.error("[UserService] Update Profile Error:", error);
      return {
        data: null,
        error: { message: error.message || "Failed to update profile" },
      };
    }
  },
};
