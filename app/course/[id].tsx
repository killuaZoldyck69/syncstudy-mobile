// app/course/[id].tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
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

  // Helper to format dates like "Oct 20"
  const formatDate = (isoString: string | null) => {
    if (!isoString) return "TBA";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons
              name="people"
              size={22}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Conditionally render ADD LECTURE button based on RBAC */}
          {canEdit && (
            <TouchableOpacity activeOpacity={0.8}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryGradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.addLectureBtn}
              >
                <Text style={styles.addLectureText}>+ ADD LECTURE</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.iconButton}>
            <Ionicons
              name="ellipsis-vertical"
              size={22}
              color={theme.colors.textSecondary}
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
            {/* Map over assessments here when they exist in the backend */}
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
                {/* Standard Accordion UI implementation goes here */}
              </View>
            ))
          )}
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
  headerRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  addLectureBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.shapes.radius.pill,
  },
  addLectureText: {
    fontFamily: theme.typography.bodyBold,
    fontSize: 11,
    color: theme.colors.textPrimary,
  },

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
    color: theme.colors.primary,
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
});
