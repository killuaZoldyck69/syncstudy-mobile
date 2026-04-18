import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const SERVER_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace("/api", "") ||
  "http://localhost:5000";

export const authClient = createAuthClient({
  baseURL: SERVER_URL,

  fetchOptions: {
    credentials: "include",
    // ADD THIS: Manually inject the Origin header for mobile devices
    headers:
      Platform.OS !== "web"
        ? {
            Origin: SERVER_URL,
          }
        : undefined,
  },

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
