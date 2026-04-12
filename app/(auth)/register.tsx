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
import React, { useMemo, useRef, useState } from "react";
import {
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

type University = (typeof bdUniversities)[0];

export default function RegisterScreen() {
  const router = useRouter();

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [university, setUniversity] = useState("");
  const [department, setDepartment] = useState("");
  const [studentId, setStudentId] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Bottom Sheet & Search State
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["50%", "80%"], []);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter the JSON object array based on the .name property
  const filteredUniversities = useMemo(() => {
    return bdUniversities.filter((uni) =>
      uni.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  const openUniversityModal = () => {
    Keyboard.dismiss();
    bottomSheetModalRef.current?.present();
  };

  const selectUniversity = (uniName: string) => {
    setUniversity(uniName);
    setSearchQuery("");
    bottomSheetModalRef.current?.dismiss();
  };

  const handleRegister = () => {
    console.log("[Auth] Attempting Registration for:", name, email, university);
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
          <View style={styles.header}>
            <Ionicons name="book" size={24} color={theme.colors.primary} />
            <Text style={styles.headerText}>SyncStudy</Text>
          </View>

          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>Create your</Text>
            <Text style={styles.heroTitleHighlight}>focus identity.</Text>
            <Text style={styles.heroSubtitle}>
              Join the network of nocturnal scholars mastering deep work.
            </Text>
          </View>

          <View style={styles.formContainer}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>FULL NAME</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Dorian Grey"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={name}
                  onChangeText={setName}
                />
                <Ionicons
                  name="person"
                  size={18}
                  color={theme.colors.textSecondary}
                  style={styles.inputIcon}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="scholar@syncstudy.edu"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
                <Ionicons
                  name="at"
                  size={20}
                  color={theme.colors.textSecondary}
                  style={styles.inputIcon}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••••••"
                  placeholderTextColor={theme.colors.textSecondary}
                  secureTextEntry={true}
                  value={password}
                  onChangeText={setPassword}
                />
                <Ionicons
                  name="lock-closed"
                  size={18}
                  color={theme.colors.textSecondary}
                  style={styles.inputIcon}
                />
              </View>
            </View>

            {/* SELECT UNIVERSITY - Triggers Bottom Sheet */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>SELECT UNIVERSITY</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.inputWrapper}
                onPress={openUniversityModal}
              >
                <Text
                  style={[
                    styles.input,
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
                  style={styles.inputIcon}
                />
              </TouchableOpacity>
            </View>

            {/* Department & Student ID Row */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>DEPARTMENT</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Design"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={department}
                    onChangeText={setDepartment}
                  />
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>
                  STUDENT ID <Text style={styles.optionalText}>(optional)</Text>
                </Text>
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

            {/* Submit Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleRegister}
              style={styles.buttonMargin}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryGradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>Create Account</Text>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={theme.colors.textPrimary}
                  style={{ marginLeft: 8 }}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.footerLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
            {/* Swap to the standard React Native TextInput */}
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
          // 1. Add the type to the keyExtractor item
          keyExtractor={(item: University) => item.name}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          // 2. Use the clean type here too
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
  keyboardAvoid: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
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
  heroSection: { marginBottom: theme.spacing.xl },
  heroTitle: {
    fontFamily: theme.typography.heading,
    fontSize: 38,
    color: theme.colors.textPrimary,
    lineHeight: 44,
    letterSpacing: -1,
  },
  heroTitleHighlight: {
    fontFamily: theme.typography.heading,
    fontSize: 38,
    color: theme.colors.primary,
    lineHeight: 44,
    letterSpacing: -1,
    marginBottom: theme.spacing.sm,
  },
  heroSubtitle: {
    fontFamily: theme.typography.body,
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  formContainer: { gap: theme.spacing.lg },
  inputGroup: { gap: theme.spacing.xs },
  row: { flexDirection: "row", gap: theme.spacing.md },
  label: {
    fontFamily: theme.typography.bodyMedium,
    fontSize: 11,
    letterSpacing: 1.5,
    color: theme.colors.textSecondary,
    marginLeft: 4,
    textTransform: "uppercase",
  },
  optionalText: { textTransform: "lowercase", color: "#666" },
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
  inputIcon: { marginLeft: 12 },
  buttonMargin: { marginTop: theme.spacing.md },
  primaryButton: {
    width: "100%",
    height: 56,
    borderRadius: theme.shapes.radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    marginTop: theme.spacing.xl,
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
