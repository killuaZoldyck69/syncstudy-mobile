import { apiClient } from "./client";

export interface Course {
  id: string;
  course_code: string;
  course_name: string;
  university_name: string;
  department: string;
  term_offered: string;
  section: string;
  instructor_name: string;
  member_count: number;
  is_joined?: boolean;
}

export interface CourseAPIResponse {
  success: boolean;
  message: string;
  data: Course[];
}

export interface CreateCoursePayload {
  code: string;
  department: string;
  name: string;
  section: string;
  term: string;
}

export const courseService = {
  searchCourses: async (query: string = "") => {
    try {
      const endpoint = query
        ? `/courses/search?q=${encodeURIComponent(query)}`
        : `/courses/search`;

      // 2. Use the new response type here
      const response = await apiClient<CourseAPIResponse>(endpoint);

      // 3. UNWRAP IT HERE! We only send the actual array (response.data) to the UI
      return { data: response.data, error: null };
    } catch (error: any) {
      console.error("[CourseService] Search Courses Error:", error);
      return {
        data: null,
        error: { message: error.message || "Failed to search hubs." },
      };
    }
  },

  /**
   * Creates a new course hub.
   */
  createCourse: async (payload: CreateCoursePayload) => {
    try {
      const response = await apiClient<Course>("/courses", {
        method: "POST",
        data: payload,
      });
      return { data: response, error: null };
    } catch (error: any) {
      console.error("[CourseService] Create Course Error:", error);
      return {
        data: null,
        error: { message: error.message || "Failed to create hub." },
      };
    }
  },

  /**
   * Toggles the join status for a specific course hub.
   * Assumes your backend has a route like POST /api/courses/:id/join
   */
  joinCourse: async (courseId: string) => {
    try {
      const response = await apiClient<any>(`/courses/${courseId}/join`, {
        method: "POST",
      });
      return { data: response, error: null };
    } catch (error: any) {
      console.error("[CourseService] Join Course Error:", error);
      return {
        data: null,
        error: { message: error.message || "Failed to join hub." },
      };
    }
  },
};
