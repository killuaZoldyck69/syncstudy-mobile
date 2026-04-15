import { theme } from "@/constants/theme";
import { apiClient } from "@/src/api/client";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar as RNStatusBar,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      console.log("[Auth] Attempting Login with:", email);

      // Call your BetterAuth endpoint
      const response = await apiClient("/auth/sign-in/email", {
        data: {
          email,
          password,
        },
      });

      console.log("[Auth] Login Success:", response);
      // TODO: Save the session token to AsyncStorage here later

      Alert.alert("Success", "Welcome back to your workspace!");
      router.push("/(tabs)/profile"); // Navigate to main app
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Brand Header */}
          <View style={styles.header}>
            <Ionicons name="book" size={24} color={theme.colors.primary} />
            <Text style={styles.headerText}>SyncStudy</Text>
          </View>

          {/* Hero Typography Section */}
          <View style={styles.heroSection}>
            <Text style={styles.eyebrowText}>WELCOME BACK</Text>
            <Text style={styles.heroTitle}>Enter your</Text>
            <Text style={styles.heroTitleHighlight}>workspace.</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={theme.colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="scholar@syncstudy.edu"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.label}>PASSWORD</Text>
                <TouchableOpacity
                  onPress={() => console.log("[Nav] Forgot Password clicked")}
                >
                  <Text style={styles.forgotText}>FORGOT?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={theme.colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={theme.colors.textSecondary}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleLogin}
              style={styles.buttonMargin}
              disabled={isLoading} // Prevent double-clicks
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryGradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.primaryButton, isLoading && { opacity: 0.7 }]}
              >
                {isLoading ? (
                  <ActivityIndicator color={theme.colors.textPrimary} />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>Log In</Text>
                    <Ionicons
                      name="arrow-forward"
                      size={20}
                      color={theme.colors.textPrimary}
                      style={{ marginLeft: 8 }}
                    />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Footer Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.footerLink}>Register here.</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: Platform.OS === "android" ? RNStatusBar.currentHeight : 0,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    gap: 8,
  },
  headerText: {
    fontFamily: theme.typography.heading,
    fontSize: 20,
    color: theme.colors.textPrimary,
  },
  heroSection: {
    marginBottom: theme.spacing.xl * 1.5,
  },
  eyebrowText: {
    fontFamily: theme.typography.bodyMedium,
    fontSize: 12,
    letterSpacing: 2,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  heroTitle: {
    fontFamily: theme.typography.heading,
    fontSize: 40,
    color: theme.colors.textPrimary,
    lineHeight: 48,
    letterSpacing: -1,
  },
  heroTitleHighlight: {
    fontFamily: theme.typography.heading,
    fontSize: 40,
    color: theme.colors.primary,
    lineHeight: 48,
    letterSpacing: -1,
  },
  formContainer: {
    gap: theme.spacing.lg,
  },
  inputGroup: {
    gap: theme.spacing.xs,
  },
  passwordLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontFamily: theme.typography.bodyMedium,
    fontSize: 12,
    letterSpacing: 1,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  forgotText: {
    fontFamily: theme.typography.bodyBold,
    fontSize: 12,
    color: theme.colors.primary,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.shapes.radius.standard,
    borderWidth: 1,
    borderColor: "transparent",
    paddingHorizontal: theme.spacing.md,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: theme.typography.body,
    fontSize: 16,
    color: theme.colors.textPrimary,
    height: "100%",
  },
  eyeIcon: {
    padding: theme.spacing.sm,
  },
  buttonMargin: {
    marginTop: theme.spacing.md,
  },
  primaryButton: {
    width: "100%",
    height: 56,
    borderRadius: theme.shapes.radius.pill, // Using pill radius to match the mockup perfectly
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    // Mockup shows a subtle glow/shadow on the button
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonText: {
    fontFamily: theme.typography.bodyBold,
    color: theme.colors.textPrimary,
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.spacing.xl * 1.5,
  },
  footerText: {
    fontFamily: theme.typography.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  footerLink: {
    fontFamily: theme.typography.bodyBold,
    fontSize: 14,
    color: theme.colors.primary,
  },
});
