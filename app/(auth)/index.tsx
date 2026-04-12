import { theme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  StatusBar as RNStatusBar,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Import your decoupled design system

export default function SplashScreen() {
  const router = useRouter();

  const handleCreateAccount = () => {
    console.log("[Nav] Navigating to Registration Screen");
    router.push("/(auth)/register");
  };

  const handleLogin = () => {
    console.log("[Nav] Navigating to Login Screen");
    router.push("/(auth)/login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Center Content: Brand Identity */}
        <View style={styles.centerContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="school" size={56} color={theme.colors.primary} />
          </View>

          <Text style={styles.title}>SyncStudy</Text>
          <Text style={styles.tagline}>Your syllabus, synchronized.</Text>
        </View>

        {/* Bottom Action Area */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity activeOpacity={0.8} onPress={handleCreateAccount}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Create Account</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.6}
            style={styles.secondaryButton}
            onPress={handleLogin}
          >
            <Text style={styles.secondaryButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: Platform.OS === "android" ? RNStatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: "space-between",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.shapes.radius.standard * 2,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontFamily: theme.typography.heading,
    fontSize: 44,
    color: theme.colors.textPrimary,
    letterSpacing: -1,
    marginBottom: theme.spacing.sm,
  },
  tagline: {
    fontFamily: theme.typography.bodyMedium,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  bottomContainer: {
    paddingBottom: Platform.OS === "ios" ? theme.spacing.lg : theme.spacing.xl,
    gap: theme.spacing.md,
  },
  primaryButton: {
    width: "100%",
    paddingVertical: theme.spacing.md,
    borderRadius: theme.shapes.radius.standard,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontFamily: theme.typography.bodyBold,
    color: theme.colors.textPrimary,
    fontSize: 16,
  },
  secondaryButton: {
    width: "100%",
    paddingVertical: theme.spacing.md,
    borderRadius: theme.shapes.radius.standard,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.transparent,
  },
  secondaryButtonText: {
    fontFamily: theme.typography.bodyMedium,
    color: theme.colors.primary,
    fontSize: 16,
  },
});
