// app/(tabs)/index.tsx
import { theme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router"; // <-- Added useFocusEffect
import React, { useCallback, useState } from "react"; // <-- Added useCallback, removed useEffect
import {
  ActivityIndicator,
  Alert,
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
import { DashboardHub, courseService } from "../../src/api/course.service";
import { authClient } from "../../src/lib/auth-client";

// --- MOCK NOTIFICATIONS ---
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

// --- DEDICATED HUB CARD COMPONENT ---
function HubCard({ hub }: { hub: DashboardHub }) {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);

  // THE FIX: useFocusEffect triggers every time the screen comes into view
  useFocusEffect(
    useCallback(() => {
      if (hub.id.length > 10) {
        courseService.getCourseProgressStats(hub.id).then((res) => {
          if (res.data) setStats(res.data);
        });
      }
    }, [hub.id]),
  );

  let isUrgent = false;
  let assessmentDisplayDate = "";
  if (hub.next_assessment?.date_time) {
    const due = new Date(hub.next_assessment.date_time);
    const now = new Date();
    const diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    isUrgent = diffDays >= 0 && diffDays <= 3;

    assessmentDisplayDate = due.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const progress = stats
    ? stats.completion_percentage
    : hub.completion_percentage;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.card}
      onPress={() => router.push(`/course/${hub.id}` as any)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.courseCode}>{hub.course_code}</Text>
        <View
          style={[
            styles.roleBadge,
            hub.my_role === "VIEWER" && styles.roleBadgeViewer,
          ]}
        >
          <Text style={styles.roleText}>{hub.my_role}</Text>
        </View>
      </View>

      <Text style={styles.courseName}>{hub.title}</Text>

      <View style={styles.metadataRow}>
        <Text style={styles.metadataText}>Section {hub.section}</Text>
        {hub.instructor && (
          <>
            <View style={styles.dot} />
            <Text style={styles.metadataText}>{hub.instructor}</Text>
          </>
        )}
        <View style={styles.dot} />
        <View style={styles.membersWrapper}>
          <Ionicons name="people" size={14} color={theme.colors.primary} />
          <Text style={styles.metadataText}>{hub.member_count} Members</Text>
        </View>
      </View>

      <View style={styles.assessmentRow}>
        {hub.next_assessment ? (
          <>
            <View style={[styles.iconBox, isUrgent && styles.iconBoxUrgent]}>
              <Ionicons
                name="time"
                size={16}
                color={isUrgent ? "#EAB308" : theme.colors.textSecondary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.assessmentText} numberOfLines={1}>
                {hub.next_assessment.title}
              </Text>
              <Text style={styles.assessmentDateText}>
                {assessmentDisplayDate}
              </Text>
            </View>
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

      {/* DYNAMIC PROGRESS BAR */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTextRow}>
          <Text style={styles.progressLabel}>Course Completion</Text>
          <Text style={styles.progressValue}>{progress}%</Text>
        </View>

        <View style={styles.progressTrack}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progress}%` }]}
          />
        </View>

        {stats && (
          <Text style={styles.progressSubtitle}>
            {stats.completed_sub_topics} of {stats.total_sub_topics} sub-topics
            completed
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const user = session?.user as any;

  const [activeHubs, setActiveHubs] = useState<DashboardHub[]>([]);
  const [archivedHubs, setArchivedHubs] = useState<DashboardHub[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showNotifications, setShowNotifications] = useState(false);
  const [isArchivedExpanded, setIsArchivedExpanded] = useState(false);

  const firstName = user?.name ? user.name.split(" ")[0] : "Scholar";

  // THE FIX: useFocusEffect silently refetches the list when returning to the tab
  useFocusEffect(
    useCallback(() => {
      const fetchMyHubs = async () => {
        // Only show the big loading spinner if we have NO data yet
        if (activeHubs.length === 0 && archivedHubs.length === 0) {
          setIsLoading(true);
        }

        const { data, error } = await courseService.getMyUserHubs();

        if (error) {
          Alert.alert("Error", error.message);
        } else if (data) {
          setActiveHubs(data.active);
          setArchivedHubs(data.archived);
        }
        setIsLoading(false);
      };

      fetchMyHubs();
    }, [activeHubs.length, archivedHubs.length]),
  );

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

  return (
    <SafeAreaView style={styles.safeArea}>
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
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.createHubBanner}>
          <Text style={styles.createHubText}>Lead a study group?</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/create-hub")}
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

        <Text style={styles.sectionEyebrow}>ACTIVE HUBS</Text>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            style={{ marginVertical: 40 }}
          />
        ) : activeHubs.length === 0 ? (
          <View style={styles.emptyStateBox}>
            <Ionicons
              name="library-outline"
              size={32}
              color="#666"
              style={{ marginBottom: 12 }}
            />
            <Text style={styles.emptyStateText}>
              You haven&apos;t joined any hubs yet.
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/explore")}>
              <Text style={styles.emptyStateLink}>Explore Hubs</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.hubsContainer}>
            {activeHubs.map((hub) => (
              <HubCard key={hub.id} hub={hub} />
            ))}
          </View>
        )}

        {/* ARCHIVED HUBS ACCORDION */}
        {!isLoading && (
          <>
            <TouchableOpacity
              style={styles.archivedHeader}
              activeOpacity={0.7}
              onPress={() => setIsArchivedExpanded(!isArchivedExpanded)}
            >
              <Text style={styles.archivedText}>
                Archived Hubs ({archivedHubs.length})
              </Text>
              <Ionicons
                name={isArchivedExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color={theme.colors.textPrimary}
              />
            </TouchableOpacity>

            {isArchivedExpanded && (
              <View style={[styles.hubsContainer, { marginTop: 16 }]}>
                {archivedHubs.length === 0 ? (
                  <Text
                    style={[
                      styles.metadataText,
                      { textAlign: "center", marginVertical: 12 },
                    ]}
                  >
                    No archived hubs.
                  </Text>
                ) : (
                  archivedHubs.map((hub) => <HubCard key={hub.id} hub={hub} />)
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>

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

  sectionEyebrow: {
    fontFamily: theme.typography.bodyBold,
    fontSize: 12,
    letterSpacing: 1.5,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  hubsContainer: { gap: theme.spacing.lg, marginBottom: theme.spacing.xl },

  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.shapes.radius.standard,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: "#2a2a2a",
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
    fontFamily: theme.typography.bodyBold,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  assessmentDateText: {
    fontFamily: theme.typography.body,
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  progressContainer: { marginTop: 4 },
  progressTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontFamily: theme.typography.bodyBold,
    fontSize: 12,
    color: theme.colors.textPrimary,
  },
  progressValue: {
    fontFamily: theme.typography.bodyBold,
    fontSize: 12,
    color: theme.colors.primary,
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#2a2a2a",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: { height: "100%", borderRadius: 3 },
  progressSubtitle: {
    fontFamily: theme.typography.body,
    fontSize: 11,
    color: theme.colors.textSecondary,
  },

  emptyStateBox: {
    backgroundColor: "#1a1a1c",
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderStyle: "dashed",
    marginBottom: 24,
  },
  emptyStateText: {
    fontFamily: theme.typography.body,
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 12,
  },
  emptyStateLink: {
    fontFamily: theme.typography.bodyBold,
    fontSize: 15,
    color: theme.colors.primary,
  },

  archivedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.shapes.radius.standard,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  archivedText: {
    fontFamily: theme.typography.heading,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },

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

  createHubBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.shapes.radius.standard,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.sm,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  createHubText: {
    fontFamily: theme.typography.body,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  createHubBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: theme.shapes.radius.standard,
  },
  createHubBtnText: {
    fontFamily: theme.typography.bodyBold,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
});
