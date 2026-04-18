import { API_URL } from "@/constants/config";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

interface FetchOptions extends RequestInit {
  data?: any;
}

export const apiClient = async <T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> => {
  const { data, headers, ...customConfig } = options;

  // 1. Prepare base headers
  const requestHeaders: any = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...headers,
  };

  // 2. MOBILE FIX: Inject the Bearer token and Origin Header
  if (Platform.OS !== "web") {
    // Satisfy backend CSRF checks
    requestHeaders["Origin"] = API_URL.replace("/api", "");

    try {
      const token = await SecureStore.getItemAsync("better-auth.session_token");
      if (token) {
        requestHeaders["Authorization"] = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn("Failed to retrieve token from SecureStore", err);
    }
  }

  const config: RequestInit = {
    method: data ? "POST" : "GET",
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include", // Keeps Web cookie support perfectly intact!
    headers: requestHeaders,
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
