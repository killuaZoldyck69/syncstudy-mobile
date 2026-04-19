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
  course_code: string;
  course_name: string;
  department: string;
  section: string;
  term_offered: string;
  instructor_name: string;
  university_name: string;
  midterm_week_start?: string | null;
  final_week_start?: string | null;
}

export interface Assessment {
  id: string;
  title: string;
  due_date: string;
  type: string;
}

export interface Topic {
  id: string;
  title: string;
  status: "NOT_STARTED" | "READING_DONE" | "COMPLETED";
  date: string;
  subtopics: { id: string; title: string; is_completed: boolean }[];
  drive_link?: string;
}

export interface CourseDetails {
  course_info: {
    id: string;
    course_code: string;
    course_name: string;
    university_name: string;
    department: string;
    section: string;
    instructor_name: string;
    term_offered: string;
    midterm_week_start: string | null;
    final_week_start: string | null;
  };
  user_context: {
    role: "ADMIN" | "MODERATOR" | "VIEWER" | "MEMBER";
    mid_term_progress: number;
    final_term_progress: number;
  };
  community: {
    total_members: number;
    member_list: {
      user_id: string;
      name: string;
      image: string;
      role: string;
    }[];
  };
  assessments: Assessment[];
  topics: Topic[];
}

export interface CourseDetailsAPIResponse {
  success: boolean;
  message: string;
  data: CourseDetails;
}

export interface UpdateCoursePayload {
  course_code?: string;
  course_name?: string;
  department?: string;
  section?: string;
  term_offered?: string;
  instructor_name?: string;
  midterm_week_start?: string | null;
  final_week_start?: string | null;
}

export interface CourseMember {
  user_id: string;
  name: string;
  email?: string;
  image: string;
  role: "ADMIN" | "MODERATOR" | "VIEWER" | "MEMBER";
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
   * Joins a course hub (Auth User)
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

  getCourseDetails: async (courseId: string) => {
    try {
      const response = await apiClient<CourseDetailsAPIResponse>(
        `/courses/${courseId}`,
      );
      return { data: response.data, error: null };
    } catch (error: any) {
      console.error("[CourseService] Get Course Details Error:", error);
      return {
        data: null,
        error: { message: error.message || "Failed to load course details." },
      };
    }
  },

  /**
   * Updates an existing course hub.
   */
  updateCourse: async (courseId: string, payload: UpdateCoursePayload) => {
    try {
      const response = await apiClient<any>(`/courses/${courseId}`, {
        method: "PUT",
        data: payload,
      });
      return { data: response, error: null };
    } catch (error: any) {
      console.error("[CourseService] Update Course Error:", error);
      return {
        data: null,
        error: { message: error.message || "Failed to update hub." },
      };
    }
  },

  /**
   * Deletes a course hub (Admin only).
   */
  deleteCourse: async (courseId: string) => {
    try {
      const response = await apiClient<any>(`/courses/${courseId}`, {
        method: "DELETE",
      });
      return { data: response, error: null };
    } catch (error: any) {
      console.error("[CourseService] Delete Course Error:", error);
      return {
        data: null,
        error: { message: error.message || "Failed to delete hub." },
      };
    }
  },

  /**
   * Leaves a course hub & wipes progress (Course Member).
   */
  leaveCourse: async (courseId: string) => {
    try {
      const response = await apiClient<any>(`/courses/${courseId}/leave`, {
        method: "DELETE",
      });
      return { data: response, error: null };
    } catch (error: any) {
      console.error("[CourseService] Leave Course Error:", error);
      return {
        data: null,
        error: { message: error.message || "Failed to leave hub." },
      };
    }
  },

  /**
   * Fetches detailed course roster (Admin / Mod only).
   */
  getCourseMembers: async (courseId: string) => {
    try {
      const response = await apiClient<any>(`/courses/${courseId}/members`);
      // Assuming your backend returns { success: true, data: [...] }
      return { data: response.data || response, error: null };
    } catch (error: any) {
      console.error("[CourseService] Get Members Error:", error);
      return {
        data: null,
        error: { message: error.message || "Failed to load members." },
      };
    }
  },

  /**
   * Updates a member's role (Admin only).
   */
  updateMemberRole: async (
    courseId: string,
    targetUserId: string,
    newRole: string,
  ) => {
    try {
      const response = await apiClient<any>(
        `/courses/${courseId}/members/${targetUserId}/role`,
        {
          method: "PATCH", // Matches your Express router
          data: { role: newRole }, // Send the new role in the request body
        },
      );
      return { data: response, error: null };
    } catch (error: any) {
      console.error("[CourseService] Update Role Error:", error);
      return {
        data: null,
        error: { message: error.message || "Failed to update role." },
      };
    }
  },

  /**
   * Removes a member from the hub (Admin only).
   */
  removeCourseMember: async (courseId: string, targetUserId: string) => {
    try {
      const response = await apiClient<any>(
        `/courses/${courseId}/members/${targetUserId}`,
        {
          method: "DELETE", // Matches your Express router
        },
      );
      return { data: response, error: null };
    } catch (error: any) {
      console.error("[CourseService] Remove Member Error:", error);
      return {
        data: null,
        error: { message: error.message || "Failed to remove member." },
      };
    }
  },
};
