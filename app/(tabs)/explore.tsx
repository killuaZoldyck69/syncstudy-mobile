import { theme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  StatusBar as RNStatusBar,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Course, courseService } from "../../src/api/course.service";

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [hubs, setHubs] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoiningId, setIsJoiningId] = useState<string | null>(null);

  // 1. DEBOUNCER: Wait 500ms after user stops typing to trigger the search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // 2. FETCHER: Run whenever the debounced query changes
  useEffect(() => {
    fetchHubs(debouncedQuery);
  }, [debouncedQuery]);

  const fetchHubs = async (query: string) => {
    setIsLoading(true);

    // 'data' here is now strictly guaranteed to be a pure Course[] array!
    const { data, error } = await courseService.searchCourses(query);

    if (error) {
      Alert.alert("Error", error.message);
    } else if (data) {
      setHubs(data);
    }
    setIsLoading(false);
  };

  const handleJoinToggle = async (
    hubId: string,
    currentStatus: boolean | undefined,
  ) => {
    if (currentStatus) {
      Alert.alert("Already Joined", "You are already a member of this hub.");
      return;
    }

    setIsJoiningId(hubId);
    const { error } = await courseService.joinCourse(hubId);

    if (error) {
      Alert.alert("Failed to join", error.message);
    } else {
      setHubs((prevHubs) =>
        prevHubs.map((hub) =>
          hub.id === hubId
            ? { ...hub, is_joined: true, members: (hub.member_count || 0) + 1 }
            : hub,
        ),
      );
    }
    setIsJoiningId(null);
  };

  const renderHubCard = ({ item }: { item: Course }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {/* Updated to course_code */}
        <Text style={styles.courseCode}>{item.course_code}</Text>

        {/* Safely hide the pill if term_offered is empty */}
        {item.term_offered ? (
          <View style={styles.termPill}>
            <Text style={styles.termText}>{item.term_offered}</Text>
          </View>
        ) : null}
      </View>

      {/* Defensive fallback for empty departments */}
      <Text style={styles.departmentText}>{item.department || "General"}</Text>

      {/* Updated to course_name */}
      <Text style={styles.courseName}>{item.course_name}</Text>

      <View style={styles.metadataRow}>
        {/* Updated to instructor_name with a fallback */}
        <Text style={styles.metadataText}>
          {item.instructor_name
            ? `Prof. ${item.instructor_name}`
            : "Instructor TBA"}
        </Text>
        <View style={styles.dot} />

        <Text style={styles.metadataText}>Section {item.section || "N/A"}</Text>
        <View style={styles.dot} />

        <View style={styles.membersWrapper}>
          <Ionicons name="people" size={14} color={theme.colors.primary} />
          {/* Fallback to 0 if members is undefined */}
          <Text style={styles.metadataText}>
            {item.member_count || 0} Members
          </Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleJoinToggle(item.id, item.is_joined)}
        disabled={isJoiningId === item.id}
        style={[
          styles.actionButton,
          item.is_joined ? styles.joinedButton : styles.joinButton,
        ]}
      >
        {isJoiningId === item.id ? (
          <ActivityIndicator color={theme.colors.textPrimary} size="small" />
        ) : item.is_joined ? (
          <>
            <Ionicons
              name="checkmark"
              size={18}
              color={theme.colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.joinedButtonText}>Joined</Text>
          </>
        ) : (
          <Text style={styles.joinButtonText}>+ Join Hub</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <Text style={styles.pageTitle}>Explore Hubs</Text>
        <Text style={styles.pageSubtitle}>
          Search for your classes by course code or name.
        </Text>

        <View style={styles.searchWrapper}>
          <Ionicons
            name="search"
            size={20}
            color={theme.colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search (e.g., CSE 4131)..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
        </View>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Available Hubs</Text>

        {isLoading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            // 3. IMPORTANT: Map directly to `hubs`, no more `filteredHubs`!
            data={hubs}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderHubCard}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No hubs found matching your search.
              </Text>
            }
          />
        )}
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
  headerContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  pageTitle: {
    fontFamily: theme.typography.heading,
    fontSize: 32,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  pageSubtitle: {
    fontFamily: theme.typography.body,
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    lineHeight: 24,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.shapes.radius.standard,
    paddingHorizontal: theme.spacing.md,
    height: 52,
  },
  searchIcon: { marginRight: 10 },
  searchInput: {
    flex: 1,
    fontFamily: theme.typography.body,
    fontSize: 16,
    color: theme.colors.textPrimary,
    height: "100%",
  },
  listContainer: { flex: 1, paddingHorizontal: theme.spacing.lg },
  sectionTitle: {
    fontFamily: theme.typography.heading,
    fontSize: 18,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  flatListContent: { paddingBottom: 40, gap: theme.spacing.md },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.shapes.radius.standard,
    padding: theme.spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  courseCode: {
    fontFamily: theme.typography.heading,
    fontSize: 22,
    color: theme.colors.textPrimary,
  },
  termPill: {
    backgroundColor: "rgba(157, 120, 245, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.shapes.radius.pill,
  },
  termText: {
    fontFamily: theme.typography.bodyBold,
    fontSize: 10,
    color: theme.colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  departmentText: {
    fontFamily: theme.typography.body,
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  courseName: {
    fontFamily: theme.typography.heading,
    fontSize: 18,
    color: theme.colors.primary,
    marginBottom: 12,
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 20,
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
  actionButton: {
    width: "100%",
    height: 48,
    borderRadius: theme.shapes.radius.standard,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  joinButton: {
    borderWidth: 1,
    borderColor: "#444",
    borderStyle: "dashed",
    backgroundColor: "transparent",
  },
  joinedButton: { backgroundColor: "#222" },
  joinButtonText: {
    fontFamily: theme.typography.bodyBold,
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  joinedButtonText: {
    fontFamily: theme.typography.bodyBold,
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
  emptyText: {
    fontFamily: theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: theme.spacing.xl,
  },
});
