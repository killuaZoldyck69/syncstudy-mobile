import { theme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  StatusBar as RNStatusBar,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { authClient } from "../../src/lib/auth-client";

export default function ProfileScreen() {
  const router = useRouter();

  const { data: session, isPending, error } = authClient.useSession();

  console.log(session);

  // 2. Wrap the redirect logic inside a useEffect
  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/(auth)/login");
    }
  }, [isPending, session, router]);

  const handleLogout = async () => {
    try {
      // 1. Tell the backend to destroy the session
      await authClient.signOut();

      // 2. THE FIX: Manually wipe the token from the phone's SecureStore
      if (Platform.OS !== "web") {
        await SecureStore.deleteItemAsync("better-auth.session_token");
      }

      // 3. Navigate back to login
      router.replace("/(auth)/login");
    } catch (error) {
      Alert.alert("Error", "Failed to log out properly.");
    }
  };
  // 3. Remove the old manual redirect if-statement that was here

  // Show loading state while checking the session
  if (isPending) {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  // Fallback for type safety to prevent crashes while the useEffect redirects
  if (!session) return null;

  const user = session.user as any;
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topNav}>
        <TouchableOpacity>
          <Ionicons name="menu" size={28} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>SyncStudy</Text>
        <TouchableOpacity>
          <Ionicons
            name="person-circle-outline"
            size={32}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageHeader}>Profile</Text>

        <View style={styles.avatarSection}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryGradientEnd]}
            style={styles.gradientRing}
          >
            <Image
              source={{
                uri:
                  user.image ||
                  `https://ui-avatars.com/api/?name=${user.name}&background=20201f&color=fff`,
              }}
              style={styles.avatarImage}
            />
          </LinearGradient>

          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push("/edit-profile")}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconWrapper}>
              <Ionicons
                name="school"
                size={20}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.infoLabel}>University</Text>
            </View>
            <Text style={styles.infoValue}>
              {user.university_name || "Not set"}
            </Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrapper}>
              <Ionicons name="book" size={20} color={theme.colors.primary} />
              <Text style={styles.infoLabel}>Department</Text>
            </View>
            <Text style={styles.infoValue}>{user.department || "Not set"}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrapper}>
              <Ionicons
                name="id-card"
                size={20}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.infoLabel}>Student ID</Text>
            </View>
            <Text style={styles.infoValue}>{user.student_id || "Not set"}</Text>
          </View>
        </View>

        <View style={styles.accountSection}>
          <Text style={styles.sectionEyebrow}>ACCOUNT</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons
                name="lock-closed"
                size={20}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.menuItemText}>Change Password</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons
                name="notifications"
                size={20}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.menuItemText}>Notifications</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={styles.menuItemLeft}>
              <Ionicons
                name="log-out-outline"
                size={22}
                color={theme.colors.destructive}
              />
              <Text
                style={[
                  styles.menuItemText,
                  { color: theme.colors.destructive },
                ]}
              >
                Log Out
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: Platform.OS === "android" ? RNStatusBar.currentHeight : 0,
  },
  topNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  navTitle: {
    fontFamily: theme.typography.heading,
    fontSize: 18,
    color: theme.colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  pageHeader: {
    fontFamily: theme.typography.heading,
    fontSize: 32,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  avatarSection: { alignItems: "center", marginBottom: theme.spacing.xl },
  gradientRing: {
    padding: 4,
    borderRadius: 9999,
    marginBottom: theme.spacing.md,
  },
  avatarImage: {
    width: 110,
    height: 110,
    borderRadius: 9999,
    borderWidth: 4,
    borderColor: theme.colors.background,
  },
  userName: {
    fontFamily: theme.typography.heading,
    fontSize: 24,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontFamily: theme.typography.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: theme.shapes.radius.pill,
    borderWidth: 1,
    borderColor: "#333",
  },
  editButtonText: {
    fontFamily: theme.typography.bodyMedium,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.shapes.radius.standard,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
  },
  infoIconWrapper: { flexDirection: "row", alignItems: "center", gap: 12 },
  infoLabel: {
    fontFamily: theme.typography.bodyMedium,
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontFamily: theme.typography.bodyBold,
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: "#2a2a2a",
    marginVertical: theme.spacing.xs,
  },
  accountSection: { gap: theme.spacing.sm },
  sectionEyebrow: {
    fontFamily: theme.typography.bodyBold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.shapes.radius.standard,
  },
  menuItemLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  menuItemText: {
    fontFamily: theme.typography.bodyMedium,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
});
