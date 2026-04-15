import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const SERVER_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace("/api", "") ||
  "http://localhost:5000";

export const authClient = createAuthClient({
  baseURL: SERVER_URL,

  // 1. ADD THIS: Force the browser to send cookies cross-origin
  fetchOptions: {
    credentials: "include",
  },

  // 2. Keep the platform check so mobile devices use the secure vault
  plugins:
    Platform.OS !== "web"
      ? [
          expoClient({
            scheme: "syncstudymobile",
            storage: SecureStore,
          }),
        ]
      : [],
});
