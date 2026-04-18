// app/course/[id].tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

import { theme } from "@/constants/theme";
import { CourseDetails, courseService } from "../../src/api/course.service";

export default function CourseDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"MID-TERM" | "FINAL-TERM">(
    "MID-TERM",
  );

  // Dropdown Menu State
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (id) fetchDetails(id as string);
  }, [id]);

  const fetchDetails = async (courseId: string) => {
    setIsLoading(true);
    const { data, error } = await courseService.getCourseDetails(courseId);
    if (error) {
      Alert.alert("Error", error.message);
      router.back();
    } else if (data) {
      setCourse(data);
    }
    setIsLoading(false);
  };

  if (isLoading || !course) {
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

  const { course_info, user_context, assessments, topics } = course;

  // RBAC Check for Edit privileges
  const canEdit =
    user_context.role === "ADMIN" || user_context.role === "MODERATOR";

  const formatDate = (isoString: string | null) => {
    if (!isoString) return "TBA";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleEditPress = () => {
    setIsMenuOpen(false);
    router.push(`/course/edit/${id}` as any);
  };

  const handleDeletePress = () => {
    setIsMenuOpen(false); // Close the dropdown menu first

    // Trigger a native confirmation alert
    Alert.alert(
      "Delete Workspace",
      "Are you sure you want to permanently delete this hub? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive", // This makes the button natively red on iOS!
          onPress: async () => {
            setIsLoading(true); // Show the loading spinner

            const { error } = await courseService.deleteCourse(id as string);

            if (error) {
              Alert.alert("Delete Failed", error.message);
              setIsLoading(false);
            } else {
              Alert.alert("Success", "Workspace deleted successfully.");
              // Route them back to the home screen after deletion
              router.replace("/");
            }
          },
        },
      ],
    );
  };

  const handleLeavePress = () => {
    setIsMenuOpen(false); // Close the menu first

    Alert.alert(
      "Leave Workspace",
      "Are you sure you want to leave this hub? Your progress will be wiped.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive", // Native red text on iOS
          onPress: async () => {
            setIsLoading(true);

            const { error } = await courseService.leaveCourse(id as string);

            if (error) {
              Alert.alert("Leave Failed", error.message);
              setIsLoading(false);
            } else {
              Alert.alert("Success", "You have left the workspace.");
              router.replace("/"); // Send them back to home screen
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.iconButton}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.courseCode}>{course_info.course_code}</Text>
            <Text style={styles.courseName} numberOfLines={1}>
              {course_info.course_name}
            </Text>
          </View>
        </View>

        {/* Header Right - Ellipsis Icon */}
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => setIsMenuOpen(true)}
            style={styles.iconButton}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={24}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TAGS */}
        <View style={styles.tagsRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Section {course_info.section}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{course_info.instructor_name}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{course_info.term_offered}</Text>
          </View>
        </View>

        {/* PROGRESS CARDS */}
        <View style={styles.progressRow}>
          <View style={styles.progressCard}>
            <View
              style={[styles.circleRing, { borderColor: theme.colors.primary }]}
            >
              <Text style={styles.circleText}>
                {user_context.mid_term_progress}%
              </Text>
            </View>
            <Text style={styles.progressTitle}>Mid-Term</Text>
            <Text style={styles.progressSubtitle}>
              {formatDate(course_info.midterm_week_start)}
            </Text>
          </View>

          <View style={styles.progressCard}>
            <View style={[styles.circleRing, { borderColor: "#444" }]}>
              <Text style={styles.circleText}>
                {user_context.final_term_progress}%
              </Text>
            </View>
            <Text style={styles.progressTitle}>Final-Term</Text>
            <Text style={styles.progressSubtitle}>
              {formatDate(course_info.final_week_start)}
            </Text>
          </View>
        </View>

        {/* UPCOMING ASSESSMENTS */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Upcoming Assessments</Text>
          {canEdit && (
            <TouchableOpacity style={styles.smallAddBtn}>
              <Ionicons
                name="add-circle"
                size={16}
                color={theme.colors.primary}
              />
              <Text style={styles.smallAddText}>ADD</Text>
            </TouchableOpacity>
          )}
        </View>

        {assessments.length === 0 ? (
          <View style={styles.emptyStateBox}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="calendar-clear" size={24} color="#666" />
            </View>
            <Text style={styles.emptyStateText}>
              No assessments scheduled for this term.
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12 }}
          >
            <Text style={{ color: "#fff" }}>Assessments will appear here</Text>
          </ScrollView>
        )}

        {/* TABS */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "MID-TERM" && styles.activeTab]}
            onPress={() => setActiveTab("MID-TERM")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "MID-TERM" && styles.activeTabText,
              ]}
            >
              MID-TERM
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "FINAL-TERM" && styles.activeTab]}
            onPress={() => setActiveTab("FINAL-TERM")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "FINAL-TERM" && styles.activeTabText,
              ]}
            >
              FINAL-TERM
            </Text>
          </TouchableOpacity>
        </View>

        {/* LECTURES / TOPICS LIST */}
        <View style={styles.topicsContainer}>
          {topics.length === 0 ? (
            <Text style={styles.emptyTopicsText}>
              No lectures have been added to this term yet.
            </Text>
          ) : (
            topics.map((topic, index) => (
              <View key={topic.id} style={styles.topicCard}>
                <Text style={styles.topicTitle}>
                  {index + 1}. {topic.title}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* --- DROPDOWN MENU OVERLAY --- */}
      <Modal visible={isMenuOpen} transparent={true} animationType="fade">
        {/* Pressable overlay catches taps outside the menu to close it */}
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsMenuOpen(false)}
        >
          <View style={styles.dropdownMenu}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => setIsMenuOpen(false)}
            >
              <Ionicons
                name="people"
                size={18}
                color={theme.colors.textPrimary}
              />
              <Text style={styles.dropdownItemText}>Members</Text>
            </TouchableOpacity>

            {canEdit && (
              <>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => setIsMenuOpen(false)}
                >
                  <Ionicons
                    name="add-circle"
                    size={18}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[
                      styles.dropdownItemText,
                      { color: theme.colors.primary },
                    ]}
                  >
                    Add Lecture
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={handleEditPress}
                >
                  <Ionicons
                    name="pencil"
                    size={18}
                    color={theme.colors.textPrimary}
                  />
                  <Text style={styles.dropdownItemText}>Edit Hub Details</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => setIsMenuOpen(false)}
                >
                  <Ionicons
                    name="archive"
                    size={18}
                    color={theme.colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.dropdownItemText,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Archive Hub
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={handleDeletePress}
                >
                  <Ionicons name="trash" size={18} color="#ef4444" />
                  <Text style={[styles.dropdownItemText, { color: "#ef4444" }]}>
                    Delete Hub
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {!canEdit && (
              <>
                <View style={styles.menuDivider} />

                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={handleLeavePress}
                >
                  <Ionicons name="exit-outline" size={18} color="#ef4444" />
                  <Text style={[styles.dropdownItemText, { color: "#ef4444" }]}>
                    Leave Hub
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
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
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconButton: { padding: 8 },
  headerTitles: { marginLeft: 4, flex: 1 },
  courseCode: {
    fontFamily: theme.typography.heading,
    fontSize: 20,
    color: theme.colors.textPrimary,
  },
  courseName: {
    fontFamily: theme.typography.body,
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  headerRight: { flexDirection: "row", alignItems: "center" },

  scrollContent: { paddingHorizontal: theme.spacing.lg, paddingBottom: 40 },

  /* Tags */
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 },
  tag: {
    backgroundColor: "#1a1a1c",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.shapes.radius.pill,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  tagText: {
    fontFamily: theme.typography.bodyMedium,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },

  /* Progress Cards */
  progressRow: { flexDirection: "row", gap: 16, marginBottom: 32 },
  progressCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.shapes.radius.standard,
    padding: 16,
    alignItems: "center",
  },
  circleRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  circleText: {
    fontFamily: theme.typography.heading,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  progressTitle: {
    fontFamily: theme.typography.bodyBold,
    fontSize: 16,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  progressSubtitle: {
    fontFamily: theme.typography.body,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },

  /* Assessments */
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: theme.typography.heading,
    fontSize: 20,
    color: theme.colors.textPrimary,
  },
  smallAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(157, 120, 245, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  smallAddText: {
    fontFamily: theme.typography.bodyBold,
    fontSize: 12,
    color: theme.colors.primary,
  },

  /* Empty State */
  emptyStateBox: {
    backgroundColor: "#161618",
    borderRadius: theme.shapes.radius.standard,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderStyle: "dashed",
    marginBottom: 32,
  },
  emptyIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyStateText: {
    fontFamily: theme.typography.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },

  /* Tabs */
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
    marginBottom: 24,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  activeTab: { borderBottomWidth: 2, borderBottomColor: theme.colors.primary },
  tabText: {
    fontFamily: theme.typography.bodyBold,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  activeTabText: { color: theme.colors.primary },

  /* Topics */
  topicsContainer: { gap: 16 },
  emptyTopicsText: {
    fontFamily: theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: 24,
  },
  topicCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.shapes.radius.standard,
    padding: 16,
  },
  topicTitle: {
    fontFamily: theme.typography.bodyBold,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },

  /* --- Dropdown Menu Styles --- */
  modalOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  dropdownMenu: {
    position: "absolute",
    top: Platform.OS === "ios" ? 100 : 70, // Adjusts slightly below the header
    right: 16,
    width: 220,
    backgroundColor: "#1a1a1c",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    paddingVertical: 8,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  dropdownItemText: {
    fontFamily: theme.typography.bodyMedium,
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#2a2a2a",
    marginVertical: 4,
  },
});
