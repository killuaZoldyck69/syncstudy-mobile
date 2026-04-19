// app/course/members/[id].tsx
import { theme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  StatusBar as RNStatusBar,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { CourseMember, courseService } from "@/src/api/course.service";

export default function ManageMembersScreen() {
  // Extract the id AND the role passed from the Course Details screen
  const { id, role } = useLocalSearchParams();
  const router = useRouter();

  // Role Based Access Control (RBAC) Logic
  const currentUserRole = role as string;
  const canManageRoles =
    currentUserRole === "ADMIN" || currentUserRole === "MODERATOR";

  const [members, setMembers] = useState<CourseMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // State for the role management dropdown
  const [selectedMember, setSelectedMember] = useState<CourseMember | null>(
    null,
  );

  useEffect(() => {
    if (id) fetchMembers(id as string);
  }, [id]);

  const fetchMembers = async (courseId: string) => {
    setIsLoading(true);
    const { data, error } = await courseService.getCourseMembers(courseId);

    if (error) {
      Alert.alert("Access Denied", error.message);
      router.back();
    } else if (data) {
      setMembers(Array.isArray(data) ? data : data.data || []);
    }
    setIsLoading(false);
  };

  const filteredMembers = useMemo(() => {
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.email && m.email.toLowerCase().includes(searchQuery.toLowerCase())),
    );
  }, [members, searchQuery]);

  const handleRoleChange = async (newRole: string) => {
    if (!selectedMember || !id) return;

    const targetUserId = selectedMember.user_id;
    const previousRole = selectedMember.role;

    // 1. Close the modal instantly for a snappy UX
    setSelectedMember(null);

    // 2. Optimistically update the UI so the badge changes immediately
    setMembers((prevMembers) =>
      prevMembers.map((m) =>
        m.user_id === targetUserId
          ? { ...m, role: newRole as CourseMember["role"] }
          : m,
      ),
    );

    // 3. Fire the backend request
    const { error } = await courseService.updateMemberRole(
      id as string,
      targetUserId,
      newRole,
    );

    // 4. If the backend rejects it (e.g., they aren't actually an Admin), revert the UI
    if (error) {
      Alert.alert("Update Failed", error.message);
      setMembers((prevMembers) =>
        prevMembers.map((m) =>
          m.user_id === targetUserId ? { ...m, role: previousRole } : m,
        ),
      );
    }
  };

  const handleRemoveUser = () => {
    if (!selectedMember || !id) return;

    const targetUserId = selectedMember.user_id;
    const targetUserName = selectedMember.name;

    // 1. Close the context menu first so it's not hovering over the alert
    setSelectedMember(null);

    // 2. Show a native confirmation dialog
    Alert.alert(
      "Remove Member",
      `Are you sure you want to remove ${targetUserName} from this workspace?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive", // Native red text on iOS
          onPress: async () => {
            // Save a backup of the current list in case the API fails
            const previousMembers = [...members];

            // 3. Optimistically remove them from the UI instantly
            setMembers((prevMembers) =>
              prevMembers.filter((m) => m.user_id !== targetUserId),
            );

            // 4. Fire the backend request
            const { error } = await courseService.removeCourseMember(
              id as string,
              targetUserId,
            );

            // 5. If it fails, show an error and revert the UI
            if (error) {
              Alert.alert("Failed to Remove User", error.message);
              setMembers(previousMembers); // Put them back in the list
            }
          },
        },
      ],
    );
  };

  const renderMemberCard = ({ item }: { item: CourseMember }) => (
    <View style={styles.memberCard}>
      <Image
        source={{
          uri:
            item.image ||
            `https://ui-avatars.com/api/?name=${item.name}&background=20201f&color=fff`,
        }}
        style={styles.avatar}
      />
      <View style={styles.memberInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.memberName}>{item.name}</Text>
          {item.role === "ADMIN" && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>ADMIN</Text>
            </View>
          )}
        </View>
        <Text style={styles.memberSubtitle}>
          {item.role === "ADMIN"
            ? "Owner of this hub"
            : item.email || "No email provided"}
        </Text>
      </View>

      {/* Role Manager Button (Hidden for Admins, and Locked for Viewers) */}
      {item.role !== "ADMIN" && (
        <TouchableOpacity
          style={[
            styles.roleButton,
            item.role === "MODERATOR" && styles.roleButtonMod,
          ]}
          onPress={() => {
            // Only allow them to open the menu if they are an Admin/Moderator
            if (canManageRoles) setSelectedMember(item);
          }}
          activeOpacity={canManageRoles ? 0.7 : 1} // Disables click animation for viewers
        >
          <Text
            style={[
              styles.roleButtonText,
              item.role === "MODERATOR" && styles.roleButtonTextMod,
            ]}
          >
            {item.role}
          </Text>
          {/* Only show the dropdown chevron if they have permission to change it */}
          {canManageRoles && (
            <Ionicons
              name={item.role === "MODERATOR" ? "chevron-up" : "chevron-down"}
              size={14}
              color={
                item.role === "MODERATOR" ? "#fff" : theme.colors.textSecondary
              }
            />
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  if (isLoading) {
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

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {canManageRoles ? "Manage Hub Members" : "Hub Members"}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Ionicons
            name="search"
            size={20}
            color={theme.colors.textSecondary}
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or email..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Member List */}
      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item.user_id}
        renderItem={renderMemberCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Sticky Invite Button - Only visible to Admins/Moderators */}
      {canManageRoles && (
        <View style={styles.footer}>
          <TouchableOpacity activeOpacity={0.8}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.inviteButton}
            >
              <Ionicons
                name="person-add"
                size={20}
                color={theme.colors.textPrimary}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.inviteButtonText}>Invite Link</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Context Menu Modal for Role Switching */}
      <Modal visible={!!selectedMember} transparent={true} animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSelectedMember(null)}
        >
          <View style={styles.contextMenu}>
            <TouchableOpacity
              style={styles.contextItem}
              onPress={() => handleRoleChange("VIEWER")}
            >
              <Text style={styles.contextItemText}>Viewer</Text>
              {selectedMember?.role === "VIEWER" && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={theme.colors.primary}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contextItem}
              onPress={() => handleRoleChange("MODERATOR")}
            >
              <Text style={styles.contextItemText}>Moderator</Text>
              {selectedMember?.role === "MODERATOR" && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={theme.colors.primary}
                />
              )}
            </TouchableOpacity>

            {currentUserRole === "ADMIN" && (
              <TouchableOpacity
                style={styles.contextItem}
                onPress={() => handleRoleChange("ADMIN")}
              >
                <Text style={styles.contextItemText}>Admin</Text>
              </TouchableOpacity>
            )}

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.contextItem}
              onPress={handleRemoveUser}
            >
              <Ionicons
                name="person-remove"
                size={18}
                color="#ef4444"
                style={{ marginRight: 12 }}
              />
              <Text style={[styles.contextItemText, { color: "#ef4444" }]}>
                Remove User
              </Text>
            </TouchableOpacity>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  headerTitle: {
    fontFamily: theme.typography.heading,
    fontSize: 20,
    color: theme.colors.textPrimary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2a2a2a",
    justifyContent: "center",
    alignItems: "center",
  },

  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.shapes.radius.standard,
    paddingHorizontal: theme.spacing.md,
    height: 52,
  },
  searchInput: {
    flex: 1,
    fontFamily: theme.typography.body,
    fontSize: 16,
    color: theme.colors.textPrimary,
    height: "100%",
  },

  listContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: 12,
    paddingBottom: 100,
  },

  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.shapes.radius.standard,
    padding: 16,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  memberInfo: { flex: 1 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  memberName: {
    fontFamily: theme.typography.heading,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  adminBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
  },
  adminBadgeText: {
    fontFamily: theme.typography.bodyBold,
    fontSize: 10,
    color: "#4ade80",
  },
  memberSubtitle: {
    fontFamily: theme.typography.body,
    fontSize: 13,
    color: theme.colors.textSecondary,
  },

  roleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1a1a1c",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.shapes.radius.pill,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  roleButtonMod: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  roleButtonText: {
    fontFamily: theme.typography.bodyBold,
    fontSize: 11,
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
  },
  roleButtonTextMod: { color: "#fff" },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.lg,
    backgroundColor: "rgba(10, 10, 10, 0.9)",
  },
  inviteButton: {
    width: "100%",
    height: 56,
    borderRadius: theme.shapes.radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  inviteButtonText: {
    fontFamily: theme.typography.bodyBold,
    color: theme.colors.textPrimary,
    fontSize: 16,
  },

  /* Context Menu */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  contextMenu: {
    width: 250,
    backgroundColor: "#1a1a1c",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    paddingVertical: 8,
  },
  contextItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  contextItemText: {
    fontFamily: theme.typography.body,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  divider: { height: 1, backgroundColor: "#2a2a2a", marginVertical: 4 },
});
