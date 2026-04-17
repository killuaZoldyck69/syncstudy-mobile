// app/(tabs)/index.tsx
import { theme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Modal,
  Platform,
  Pressable,
  StatusBar as RNStatusBar,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { authClient } from "../../src/lib/auth-client";

// --- MOCK DATA ---
const NOTIFICATIONS = [
  {
    id: "1",
    text: "Prof. Ahmed posted a new announcement in ",
    highlight: "CSE 4131",
    time: "2 mins ago",
    unread: true,
  },
  {
    id: "2",
    text: "Quiz scheduled: Mid-Term Quiz starts in 2 days.",
    highlight: "",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: "3",
    text: "Database Systems hub updated the resources list.",
    highlight: "",
    time: "5 hours ago",
    unread: false,
  },
];

const ACTIVE_HUBS = [
  {
    id: "1",
    code: "CSE 4131",
    name: "Mobile App Development",
    section: "A",
    role: "LEADER",
    progress: 75,
    assessment: { title: "Mid-Term Quiz starts in 2 days.", isUrgent: true },
  },
  {
    id: "2",
    code: "CSE 3211",
    name: "Database Systems",
    section: "C",
    instructor: "Dr. Khan",
    members: 112,
    role: "VIEWER",
    progress: 20,
    assessment: null,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const user = session?.user as any;

  const [showNotifications, setShowNotifications] = useState(false);
  const [isArchivedExpanded, setIsArchivedExpanded] = useState(false);

  // Safely get the first name for the greeting
  const firstName = user?.name ? user.name.split(" ")[0] : "Scholar";

  const renderNotification = (notif: (typeof NOTIFICATIONS)[0]) => (
    <View key={notif.id} style={styles.notificationItem}>
      <View
        style={[
          styles.unreadDot,
          !notif.unread && { backgroundColor: "transparent" },
        ]}
      />
      <View style={styles.notificationContent}>
        <Text style={styles.notificationText}>
          {notif.text}
          {notif.highlight ? (
            <Text style={styles.notificationHighlight}>{notif.highlight}</Text>
          ) : null}
        </Text>
        <Text style={styles.notificationTime}>{notif.time}</Text>
      </View>
    </View>
  );

  const renderHubCard = (hub: (typeof ACTIVE_HUBS)[0]) => (
    <View key={hub.id} style={styles.card}>
      {/* Header Row */}
      <View style={styles.cardHeader}>
        <Text style={styles.courseCode}>{hub.code}</Text>
        <View
          style={[
            styles.roleBadge,
            hub.role === "VIEWER" && styles.roleBadgeViewer,
          ]}
        >
          <Text style={styles.roleText}>{hub.role}</Text>
        </View>
      </View>

      <Text style={styles.courseName}>{hub.name}</Text>

      {/* Metadata */}
      <View style={styles.metadataRow}>
        <Text style={styles.metadataText}>Section {hub.section}</Text>
        {hub.instructor && (
          <>
            <View style={styles.dot} />
            <Text style={styles.metadataText}>{hub.instructor}</Text>
          </>
        )}
        {hub.members && (
          <>
            <View style={styles.dot} />
            <View style={styles.membersWrapper}>
              <Ionicons name="people" size={14} color={theme.colors.primary} />
              <Text style={styles.metadataText}>{hub.members} Members</Text>
            </View>
          </>
        )}
      </View>

      {/* Assessment Alert */}
      <View style={styles.assessmentRow}>
        {hub.assessment ? (
          <>
            <View
              style={[
                styles.iconBox,
                hub.assessment.isUrgent && styles.iconBoxUrgent,
              ]}
            >
              <Ionicons
                name="time"
                size={16}
                color={
                  hub.assessment.isUrgent
                    ? "#EAB308"
                    : theme.colors.textSecondary
                }
              />
            </View>
            <Text style={styles.assessmentText}>{hub.assessment.title}</Text>
          </>
        ) : (
          <>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={theme.colors.textSecondary}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.assessmentText}>No upcoming assessments</Text>
          </>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressLabel}>
          Mid-Term Progress: {hub.progress}%
        </Text>
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${hub.progress}%` }]}
          />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={{
              uri:
                user?.image ||
                `https://ui-avatars.com/api/?name=${firstName}&background=20201f&color=fff`,
            }}
            style={styles.avatar}
          />
          <Text style={styles.greeting}>Hello, {firstName}</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowNotifications(true)}
          style={styles.bellIcon}
        >
          <Ionicons
            name="notifications"
            size={24}
            color={theme.colors.textPrimary}
          />
          {/* Unread Badge */}
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ---> ADD THIS NEW BANNER HERE <--- */}
        <View style={styles.createHubBanner}>
          <Text style={styles.createHubText}>Lead a study group?</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/create-hub")} // We will build this route next!
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.createHubBtn}
            >
              <Text style={styles.createHubBtnText}>+ Create Hub</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ACTIVE HUBS SECTION */}
        <Text style={styles.sectionEyebrow}>ACTIVE HUBS</Text>
        <View style={styles.hubsContainer}>
          {ACTIVE_HUBS.map(renderHubCard)}
        </View>

        {/* ARCHIVED HUBS ACCORDION */}
        <TouchableOpacity
          style={styles.archivedHeader}
          activeOpacity={0.7}
          onPress={() => setIsArchivedExpanded(!isArchivedExpanded)}
        >
          <Text style={styles.archivedText}>Archived Hubs (1)</Text>
          <Ionicons
            name={isArchivedExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>

        {isArchivedExpanded && (
          <Text
            style={[
              styles.metadataText,
              { marginTop: 12, textAlign: "center" },
            ]}
          >
            Archived hubs will appear here.
          </Text>
        )}
      </ScrollView>

      {/* NOTIFICATIONS MODAL OVERLAY */}
      <Modal
        visible={showNotifications}
        transparent={true}
        animationType="fade"
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowNotifications(false)}
        >
          <Pressable style={styles.notificationDropdown}>
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationTitle}>Notifications</Text>
              <Text style={styles.notificationNewText}>2 NEW</Text>
            </View>

            {NOTIFICATIONS.map(renderNotification)}

            <TouchableOpacity
              style={styles.clearAllBtn}
              onPress={() => setShowNotifications(false)}
            >
              <Text style={styles.clearAllText}>CLEAR ALL</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: Platform.OS === "android" ? RNStatusBar.currentHeight : 0,
  },

  /* Header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  userInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  greeting: {
    fontFamily: theme.typography.heading,
    fontSize: 20,
    color: theme.colors.textPrimary,
  },
  bellIcon: { position: "relative", padding: 4 },
  badge: {
    position: "absolute",
    top: 4,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: theme.colors.background,
  },

  scrollContent: { paddingHorizontal: theme.spacing.lg, paddingBottom: 40 },

  /* Section Headers */
  sectionEyebrow: {
    fontFamily: theme.typography.bodyBold,
    fontSize: 12,
    letterSpacing: 1.5,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  hubsContainer: { gap: theme.spacing.lg, marginBottom: theme.spacing.xl },

  /* Cards */
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.shapes.radius.standard,
    padding: theme.spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  courseCode: {
    fontFamily: theme.typography.heading,
    fontSize: 22,
    color: theme.colors.textPrimary,
  },
  roleBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.shapes.radius.pill,
  },
  roleBadgeViewer: { backgroundColor: "rgba(255, 255, 255, 0.05)" },
  roleText: {
    fontFamily: theme.typography.bodyBold,
    fontSize: 10,
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  courseName: {
    fontFamily: theme.typography.body,
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },

  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  metadataText: {
    fontFamily: theme.typography.body,
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#444",
    marginHorizontal: 8,
  },
  membersWrapper: { flexDirection: "row", alignItems: "center", gap: 4 },

  assessmentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#2a2a2a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconBoxUrgent: { backgroundColor: "rgba(234, 179, 8, 0.15)" },
  assessmentText: {
    fontFamily: theme.typography.body,
    fontSize: 14,
    color: theme.colors.textPrimary,
    flex: 1,
  },

  /* Progress Bar */
  progressContainer: { marginTop: 4 },
  progressLabel: {
    fontFamily: theme.typography.bodyBold,
    fontSize: 12,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#2a2a2a",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 3 },

  /* Archived Hubs */
  archivedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.shapes.radius.standard,
  },
  archivedText: {
    fontFamily: theme.typography.heading,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },

  /* Notifications Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 100 : 80,
  },
  notificationDropdown: {
    width: "90%",
    backgroundColor: "#1a1a1c",
    borderRadius: 16,
    padding: theme.spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs,
  },
  notificationTitle: {
    fontFamily: theme.typography.heading,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  notificationNewText: {
    fontFamily: theme.typography.bodyBold,
    fontSize: 11,
    color: theme.colors.primary,
    letterSpacing: 1,
  },

  notificationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginTop: 6,
    marginRight: 12,
  },
  notificationContent: { flex: 1 },
  notificationText: {
    fontFamily: theme.typography.body,
    fontSize: 14,
    color: theme.colors.textPrimary,
    lineHeight: 20,
  },
  notificationHighlight: {
    fontFamily: theme.typography.bodyBold,
    color: theme.colors.textPrimary,
  },
  notificationTime: {
    fontFamily: theme.typography.body,
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },

  clearAllBtn: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    alignItems: "center",
  },
  clearAllText: {
    fontFamily: theme.typography.bodyBold,
    fontSize: 12,
    color: theme.colors.textSecondary,
    letterSpacing: 1,
  },

  /* Create Hub Banner */
  createHubBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.shapes.radius.standard,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.sm, // Adds a little breathing room from the header
  },
  createHubText: {
    fontFamily: theme.typography.body, // or theme.typography.heading if you want it bolder
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  createHubBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: theme.shapes.radius.standard, // Matches the slight rounding in your mockup
  },
  createHubBtnText: {
    fontFamily: theme.typography.bodyBold,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
});
