import { theme } from "@/constants/theme";
import { bdUniversities } from "@/constants/universities";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
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
import { userService } from "../src/api/user.service";
import { authClient } from "../src/lib/auth-client";

type University = (typeof bdUniversities)[0];

export default function EditProfileScreen() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  // Form State
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [university, setUniversity] = useState("");
  const [department, setDepartment] = useState("");
  const [studentId, setStudentId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Bottom Sheet & Search State
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["50%", "80%"], []);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUniversities = useMemo(() => {
    return bdUniversities.filter((uni) =>
      uni.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  // Pre-fill the form when the session data loads
  useEffect(() => {
    if (session?.user) {
      const user = session.user as any;
      setName(user.name || "");
      setAvatarUrl(user.image || "");
      setUniversity(user.university_name || "");
      setDepartment(user.department || "");
      setStudentId(user.student_id || "");
    }
  }, [session]);

  const openUniversityModal = () => {
    Keyboard.dismiss();
    bottomSheetModalRef.current?.present();
  };

  const selectUniversity = (uniName: string) => {
    setUniversity(uniName);
    setSearchQuery("");
    bottomSheetModalRef.current?.dismiss();
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty.");
      return;
    }

    setIsSaving(true);

    const { error } = await userService.updateProfile({
      name,
      image: avatarUrl,
      university_name: university,
      department,
      student_id: studentId,
    });

    if (error) {
      Alert.alert("Update Failed", error.message);
      setIsSaving(false);
      return;
    }

    try {
      // 1. Remove the invalid { fetchOptions: { force: true } }
      await authClient.getSession();

      Alert.alert("Success", "Profile updated successfully!");

      // 2. Defensively route back to prevent the GO_BACK crash
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(tabs)/profile"); // Fallback if the stack was wiped
      }
    } catch (refreshError) {
      Alert.alert(
        "Notice",
        "Profile updated, but failed to refresh local session.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isPending) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  const user = session?.user;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.avatarSection}>
            <Image
              source={{
                uri:
                  avatarUrl ||
                  (user
                    ? `https://ui-avatars.com/api/?name=${user.name}&background=20201f&color=fff`
                    : undefined),
              }}
              style={styles.avatarImage}
            />
            <Text style={styles.changePhotoText}>Change Photo URL below</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PROFILE PICTURE URL (OPTIONAL)</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="https://imgur.com/your-image.png"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={avatarUrl}
                  onChangeText={setAvatarUrl}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>FULL NAME</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Nahid Hasan"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <View style={[styles.inputWrapper, { opacity: 0.6 }]}>
                <TextInput
                  style={styles.input}
                  value={user?.email || ""}
                  editable={false}
                />
                <Ionicons
                  name="lock-closed"
                  size={18}
                  color={theme.colors.textSecondary}
                />
              </View>
            </View>

            {/* ---> UPDATED UNIVERSITY FIELD <--- */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>UNIVERSITY</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.inputWrapper}
                onPress={openUniversityModal}
              >
                <Text
                  style={[
                    {
                      flex: 1,
                      fontFamily: theme.typography.body,
                      fontSize: 16,
                      color: theme.colors.textPrimary,
                    },
                    !university && { color: theme.colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {university || "Choose your institution"}
                </Text>
                <Ionicons
                  name="school"
                  size={18}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>DEPARTMENT</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="CSE"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={department}
                  onChangeText={setDepartment}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>STUDENT ID (OPTIONAL)</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="S-2024-88"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={studentId}
                  onChangeText={setStudentId}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSave}
            disabled={isSaving}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.saveButton, isSaving && { opacity: 0.7 }]}
            >
              {isSaving ? (
                <ActivityIndicator color={theme.colors.textPrimary} />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* --- UNIVERSITY SELECTION BOTTOM SHEET MODAL --- */}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: theme.colors.surface }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.textSecondary }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            opacity={0.7}
          />
        )}
      >
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Select University</Text>
          <View style={styles.searchWrapper}>
            <Ionicons
              name="search"
              size={20}
              color={theme.colors.textSecondary}
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search universities..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="words"
            />
          </View>
        </View>

        <BottomSheetFlatList
          data={filteredUniversities}
          keyExtractor={(item: University) => item.name}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }: { item: University }) => (
            <TouchableOpacity
              style={styles.sheetItem}
              onPress={() => selectUniversity(item.name)}
            >
              <Text
                style={[
                  styles.sheetItemText,
                  university === item.name && { color: theme.colors.primary },
                ]}
              >
                {item.name}
              </Text>
              {university === item.name && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={theme.colors.primary}
                />
              )}
            </TouchableOpacity>
          )}
        />
      </BottomSheetModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: Platform.OS === "android" ? RNStatusBar.currentHeight : 0,
  },
  center: { justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  backButton: { padding: 4 },
  headerTitle: {
    fontFamily: theme.typography.heading,
    fontSize: 18,
    color: theme.colors.textPrimary,
  },
  scrollContent: { paddingHorizontal: theme.spacing.lg, paddingBottom: 40 },
  avatarSection: {
    alignItems: "center",
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#333",
    marginBottom: 12,
  },
  changePhotoText: {
    fontFamily: theme.typography.bodyMedium,
    fontSize: 14,
    color: theme.colors.primary,
  },
  formContainer: { gap: theme.spacing.lg },
  inputGroup: { gap: theme.spacing.xs },
  label: {
    fontFamily: theme.typography.bodyMedium,
    fontSize: 11,
    letterSpacing: 1.5,
    color: theme.colors.textSecondary,
    marginLeft: 4,
    textTransform: "uppercase",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.shapes.radius.standard,
    paddingHorizontal: theme.spacing.md,
    height: 56,
  },
  input: {
    flex: 1,
    fontFamily: theme.typography.body,
    fontSize: 16,
    color: theme.colors.textPrimary,
    height: "100%",
  },
  footer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
  },
  saveButton: {
    width: "100%",
    height: 56,
    borderRadius: theme.shapes.radius.standard,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontFamily: theme.typography.bodyBold,
    color: theme.colors.textPrimary,
    fontSize: 16,
  },

  /* Bottom Sheet Specific Styles */
  sheetHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  sheetTitle: {
    fontFamily: theme.typography.heading,
    fontSize: 20,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1c",
    borderRadius: theme.shapes.radius.standard,
    paddingHorizontal: theme.spacing.md,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontFamily: theme.typography.body,
    fontSize: 16,
    color: theme.colors.textPrimary,
    height: "100%",
  },
  sheetItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  sheetItemText: {
    fontFamily: theme.typography.bodyMedium,
    fontSize: 16,
    color: theme.colors.textPrimary,
    flex: 1,
  },
});
