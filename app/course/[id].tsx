// app/course/[id].tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
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
import {
  CourseDetails,
  Topic,
  courseService,
} from "../../src/api/course.service";

export default function CourseDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [assessmentsList, setAssessmentsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"MID-TERM" | "FINAL-TERM">(
    "MID-TERM",
  );

  // State to track which topic accordion is open
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>(
    {},
  );

  // Dropdown Menu State
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchDetails = async (courseId: string) => {
      setIsLoading(true);

      const [detailsRes, topicsRes, assessmentsRes] = await Promise.all([
        courseService.getCourseDetails(courseId),
        courseService.getCourseTopics(courseId),
        courseService.getCourseAssessments(courseId),
      ]);

      if (detailsRes.error) {
        Alert.alert("Error", detailsRes.error.message);
        if (router.canGoBack()) router.back();
        else router.replace("/");
      } else if (detailsRes.data) {
        setCourse(detailsRes.data);
      }

      if (topicsRes.data) setTopics(topicsRes.data);
      if (assessmentsRes.data) setAssessmentsList(assessmentsRes.data);

      setIsLoading(false);
    };

    if (id) fetchDetails(id as string);
  }, [id, router]);

  const toggleTopic = (topicId: string) => {
    setExpandedTopics((prev) => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  // --- ACTION HANDLERS ---
  const handleEditPress = () => {
    setIsMenuOpen(false);
    router.push(`/course/edit/${id}` as any);
  };

  const handleDeletePress = () => {
    setIsMenuOpen(false);
    Alert.alert(
      "Delete Workspace",
      "Are you sure you want to permanently delete this hub? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            const { error } = await courseService.deleteCourse(id as string);
            if (error) {
              Alert.alert("Delete Failed", error.message);
              setIsLoading(false);
            } else {
              Alert.alert("Success", "Workspace deleted successfully.");
              router.replace("/");
            }
          },
        },
      ],
    );
  };

  const handleLeavePress = () => {
    setIsMenuOpen(false);
    Alert.alert(
      "Leave Workspace",
      "Are you sure you want to leave this hub? Your progress will be wiped.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            const { error } = await courseService.leaveCourse(id as string);
            if (error) {
              Alert.alert("Leave Failed", error.message);
              setIsLoading(false);
            } else {
              Alert.alert("Success", "You have left the workspace.");
              router.replace("/(tabs)/explore");
            }
          },
        },
      ],
    );
  };

  const handleDeleteTopic = (topicId: string, topicTitle: string) => {
    Alert.alert(
      "Delete Lecture",
      `Are you sure you want to delete "${topicTitle}"? This will permanently remove all nested sub-topics.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const previousTopics = [...topics];
            setTopics((prevTopics) =>
              prevTopics.filter((t) => t.id !== topicId),
            );

            const { error } = await courseService.deleteCourseTopic(
              id as string,
              topicId,
            );

            if (error) {
              Alert.alert("Delete Failed", error.message);
              setTopics(previousTopics);
            }
          },
        },
      ],
    );
  };

  const handleDeleteAssessment = (
    assessmentId: string,
    assessmentTitle: string,
  ) => {
    Alert.alert(
      "Delete Assessment",
      `Are you sure you want to delete "${assessmentTitle}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive", // Native red text on iOS
          onPress: async () => {
            // 1. Save a backup of the current list
            const previousAssessments = [...assessmentsList];

            // 2. Optimistically remove it from the UI instantly
            setAssessmentsList((prevList) =>
              prevList.filter((a) => a.id !== assessmentId),
            );

            // 3. Fire the backend request
            const { error } = await courseService.deleteCourseAssessment(
              id as string,
              assessmentId,
            );

            // 4. If it fails, show an error and revert the UI
            if (error) {
              Alert.alert("Delete Failed", error.message);
              setAssessmentsList(previousAssessments);
            }
          },
        },
      ],
    );
  };

  const handleToggleSubTopic = async (
    topicId: string,
    subTopicId: string,
    currentStatus: boolean,
  ) => {
    // Determine what the new status SHOULD be
    const newStatus = !currentStatus;

    // 1. Save a backup of the current topics list in case the API fails
    const previousTopics = [...topics];

    // 2. Optimistically update the UI instantly
    setTopics((prevTopics) =>
      prevTopics.map((topic) => {
        if (topic.id === topicId) {
          return {
            ...topic,
            subTopics: topic.subTopics.map((sub) =>
              sub.id === subTopicId ? { ...sub, is_completed: newStatus } : sub,
            ),
          };
        }
        return topic;
      }),
    );

    // 3. THE FIX: Fire the backend request AND pass the new status payload!
    const { error } = await courseService.toggleSubTopicProgress(
      id as string,
      subTopicId,
      newStatus,
    );

    // 4. If it fails, show an error and revert the UI to its previous state
    if (error) {
      Alert.alert("Failed to Update Progress", error.message);
      setTopics(previousTopics);
    }
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

  const { course_info, user_context } = course;
  const canEdit =
    user_context.role === "ADMIN" || user_context.role === "MODERATOR";

  const formatDate = (isoString: string | null) => {
    if (!isoString) return "TBA";
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // --- Assessment Helpers ---
  const formatAssessmentDate = (dueDate: string | null, isTba: boolean) => {
    if (isTba || !dueDate) return "To Be Announced";
    return new Date(dueDate).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getDaysLeft = (dueDate: string | null, isTba: boolean) => {
    if (isTba || !dueDate) return { text: "TBA", color: "#888", bg: "#2a2a2a" };

    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0)
      return {
        text: "PAST DUE",
        color: "#ef4444",
        bg: "rgba(239, 68, 68, 0.15)",
      };
    if (diffDays === 0)
      return {
        text: "DUE TODAY",
        color: "#f59e0b",
        bg: "rgba(245, 158, 11, 0.15)",
      };
    return {
      text: `${diffDays} DAYS LEFT`,
      color: "#f59e0b",
      bg: "rgba(245, 158, 11, 0.15)",
    };
  };

  // Filter topics dynamically based on the active tab
  const displayedTopics = topics.filter((t) =>
    activeTab === "MID-TERM"
      ? t.term_phase === "MID_TERM"
      : t.term_phase === "FINAL_TERM",
  );

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
            <TouchableOpacity
              style={styles.smallAddBtn}
              onPress={() => router.push(`/course/add-assessment/${id}` as any)}
            >
              <Ionicons
                name="add-circle"
                size={16}
                color={theme.colors.primary}
              />
              <Text style={styles.smallAddText}>ADD</Text>
            </TouchableOpacity>
          )}
        </View>

        {assessmentsList.length === 0 ? (
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
            contentContainerStyle={{
              gap: 12,
              paddingBottom: 32,
              paddingRight: 20,
            }}
          >
            {assessmentsList.map((assessment) => {
              // 1. UPDATE THIS LINE to use date_time
              const timeStatus = getDaysLeft(
                assessment.date_time,
                assessment.is_tba,
              );

              return (
                <View key={assessment.id} style={styles.assessmentCard}>
                  <View style={styles.assessmentCardHeader}>
                    <View
                      style={[
                        styles.daysLeftBadge,
                        { backgroundColor: timeStatus.bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.daysLeftText,
                          { color: timeStatus.color },
                        ]}
                      >
                        {timeStatus.text}
                      </Text>
                    </View>

                    {canEdit && (
                      <View style={{ flexDirection: "row", gap: 6 }}>
                        <TouchableOpacity
                          style={styles.actionIcon}
                          onPress={() =>
                            router.push(
                              `/course/edit-assessment/${assessment.id}?courseId=${id}` as any,
                            )
                          }
                        >
                          <Ionicons name="pencil" size={14} color="#888" />
                        </TouchableOpacity>

                        {/* THE UPDATE: Added onPress to the Trash Icon */}
                        <TouchableOpacity
                          style={styles.actionIcon}
                          onPress={() =>
                            handleDeleteAssessment(
                              assessment.id,
                              assessment.title,
                            )
                          }
                        >
                          <Ionicons name="trash" size={14} color="#888" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  <Text style={styles.assessmentTitle} numberOfLines={2}>
                    {assessment.title}
                  </Text>

                  <View style={styles.assessmentFooter}>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={theme.colors.textSecondary}
                    />
                    <Text style={styles.assessmentDate}>
                      {/* 2. UPDATE THIS LINE to use date_time */}
                      {formatAssessmentDate(
                        assessment.date_time,
                        assessment.is_tba,
                      )}
                    </Text>
                  </View>
                </View>
              );
            })}
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

        {/* DYNAMIC TOPICS LIST */}
        <View style={styles.topicsContainer}>
          {displayedTopics.length === 0 ? (
            <Text style={styles.emptyTopicsText}>
              No lectures have been added to this term yet.
            </Text>
          ) : (
            displayedTopics.map((topic) => {
              const isExpanded = !!expandedTopics[topic.id];
              const status = topic.status || "NOT_STARTED";
              const isDone =
                status === "READING_DONE" || status === "COMPLETED";
              const displayStatus = status.replace("_", " ");

              return (
                <View key={topic.id} style={styles.topicCard}>
                  {/* Topic Header / Accordion Toggle */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => toggleTopic(topic.id)}
                    style={styles.topicHeader}
                  >
                    <View style={styles.topicHeaderLeft}>
                      <Text style={styles.topicTitle}>{topic.title}</Text>
                      <Text style={styles.topicDate}>
                        {formatDate(topic.lecture_date)}
                      </Text>
                    </View>

                    <View style={styles.topicHeaderRight}>
                      {/* Status Pill */}
                      <View
                        style={[
                          styles.statusBadge,
                          isDone && styles.statusBadgeDone,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            isDone && styles.statusTextDone,
                          ]}
                        >
                          {displayStatus}
                        </Text>
                      </View>

                      {canEdit && (
                        <>
                          <TouchableOpacity
                            style={styles.actionIcon}
                            onPress={() =>
                              router.push(
                                `/course/edit-lecture/${topic.id}?courseId=${id}` as any,
                              )
                            }
                          >
                            <Ionicons name="pencil" size={16} color="#888" />
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.actionIcon}
                            onPress={() =>
                              handleDeleteTopic(topic.id, topic.title)
                            }
                          >
                            <Ionicons name="trash" size={16} color="#888" />
                          </TouchableOpacity>
                        </>
                      )}

                      <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={20}
                        color={theme.colors.textSecondary}
                        style={{ marginLeft: 4 }}
                      />
                    </View>
                  </TouchableOpacity>

                  {/* Expanded Sub-Topics Content */}
                  {isExpanded && (
                    <View style={styles.topicContent}>
                      {topic.subTopics?.map((sub) => (
                        <TouchableOpacity
                          key={sub.id}
                          style={styles.subTopicRow}
                          activeOpacity={0.7}
                          onPress={() =>
                            handleToggleSubTopic(
                              topic.id,
                              sub.id,
                              !!sub.is_completed,
                            )
                          }
                        >
                          <Ionicons
                            name={
                              sub.is_completed ? "checkbox" : "square-outline"
                            }
                            size={24}
                            color={
                              sub.is_completed ? theme.colors.primary : "#666"
                            }
                          />
                          <Text style={styles.subTopicText}>{sub.title}</Text>
                        </TouchableOpacity>
                      ))}

                      {topic.note_drive_link && (
                        <TouchableOpacity
                          style={styles.driveButton}
                          onPress={() =>
                            Linking.openURL(topic.note_drive_link as string)
                          }
                        >
                          <Ionicons
                            name="link"
                            size={18}
                            color={theme.colors.textPrimary}
                          />
                          <Text style={styles.driveButtonText}>
                            Open Drive Notes
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* --- DROPDOWN MENU OVERLAY --- */}
      <Modal visible={isMenuOpen} transparent={true} animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsMenuOpen(false)}
        >
          <View style={styles.dropdownMenu}>
            {/* VISIBLE TO EVERYONE */}
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setIsMenuOpen(false);
                router.push(
                  `/course/members/${id}?role=${user_context.role}` as any,
                );
              }}
            >
              <Ionicons
                name="people"
                size={18}
                color={theme.colors.textPrimary}
              />
              <Text style={styles.dropdownItemText}>
                {canEdit ? "Manage Members" : "View Members"}
              </Text>
            </TouchableOpacity>

            {/* ADMIN / MODERATOR ACTIONS */}
            {canEdit && (
              <>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setIsMenuOpen(false);
                    router.push(`/course/add-lecture/${id}` as any);
                  }}
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

            {/* STANDARD MEMBER ACTIONS */}
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

  /* Assessments Section Header */
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

  /* Assessment Cards */
  assessmentCard: {
    width: 240,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.shapes.radius.standard,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  assessmentCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  daysLeftBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  daysLeftText: { fontFamily: theme.typography.bodyBold, fontSize: 10 },
  assessmentTitle: {
    fontFamily: theme.typography.bodyBold,
    fontSize: 16,
    color: theme.colors.textPrimary,
    marginBottom: 12,
    height: 44, // Forces uniform card height
  },
  assessmentFooter: { flexDirection: "row", alignItems: "center", gap: 6 },
  assessmentDate: {
    fontFamily: theme.typography.body,
    fontSize: 12,
    color: theme.colors.textSecondary,
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
    marginBottom: 16,
  },
  topicHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  topicHeaderLeft: { flex: 1, paddingRight: 8 },
  topicTitle: {
    fontFamily: theme.typography.bodyBold,
    fontSize: 16,
    color: theme.colors.textPrimary,
    lineHeight: 22,
  },
  topicDate: {
    fontFamily: theme.typography.body,
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  topicHeaderRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusBadge: {
    backgroundColor: "#2a2a2a",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusBadgeDone: { backgroundColor: "rgba(157, 120, 245, 0.15)" },
  statusText: {
    fontFamily: theme.typography.bodyBold,
    fontSize: 10,
    color: "#888",
    textTransform: "uppercase",
  },
  statusTextDone: { color: theme.colors.primary },
  actionIcon: { padding: 4 },

  topicContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#2a2a2a",
  },
  subTopicRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  subTopicText: {
    fontFamily: theme.typography.body,
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  driveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#222",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  driveButtonText: {
    fontFamily: theme.typography.bodyBold,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },

  /* Dropdown Menu Overlay */
  modalOverlay: { flex: 1, backgroundColor: "transparent" },
  dropdownMenu: {
    position: "absolute",
    top: Platform.OS === "ios" ? 100 : 70,
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
  menuDivider: { height: 1, backgroundColor: "#2a2a2a", marginVertical: 4 },
});
