import { API_URL } from "@/constants/config";

interface FetchOptions extends RequestInit {
  data?: any;
}

export const apiClient = async <T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> => {
  const { data, headers, ...customConfig } = options;

  const config: RequestInit = {
    method: data ? "POST" : "GET",
    body: data ? JSON.stringify(data) : undefined,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...headers,
    },
    ...customConfig,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || "Something went wrong");
    }

    return responseData as T;
  } catch (error: any) {
    console.error(`[API Error] ${endpoint}:`, error.message);
    throw error;
  }
};
