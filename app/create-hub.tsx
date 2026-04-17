// app/create-hub.tsx
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

import { theme } from "@/constants/theme";
import { courseService } from "../src/api/course.service";
import { authClient } from "../src/lib/auth-client";

export default function CreateHubScreen() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  // Form State
  const [courseCode, setCourseCode] = useState("");
  const [section, setSection] = useState("");
  const [courseName, setCourseName] = useState("");
  const [instructor, setInstructor] = useState("");
  const [department, setDepartment] = useState("");
  const [term, setTerm] = useState("");
  const [university, setUniversity] = useState("");

  // Date Picker State
  const [midtermDate, setMidtermDate] = useState<Date | null>(null);
  const [finalDate, setFinalDate] = useState<Date | null>(null);
  const [showMidtermPicker, setShowMidtermPicker] = useState(false);
  const [showFinalPicker, setShowFinalPicker] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill the university and department from the user's session profile
  useEffect(() => {
    if (session?.user) {
      const user = session.user as any;
      setUniversity(user.university_name || "");
      setDepartment(user.department || "");
    }
  }, [session]);

  const formatDate = (date: Date | null) => {
    if (!date) return "YYYY-MM-DD";
    return date.toISOString().split("T")[0];
  };

  const handleLaunchHub = async () => {
    if (!courseCode || !courseName || !university) {
      Alert.alert(
        "Missing Fields",
        "Please fill in the course code, name, and university.",
      );
      return;
    }

    setIsSubmitting(true);

    const { error } = await courseService.createCourse({
      course_code: courseCode,
      course_name: courseName,
      department: department,
      section: section,
      term_offered: term,
      instructor_name: instructor,
      university_name: university,
      midterm_week_start: midtermDate ? midtermDate.toISOString() : null,
      final_week_start: finalDate ? finalDate.toISOString() : null,
    });

    if (error) {
      Alert.alert("Launch Failed", error.message);
      setIsSubmitting(false);
      return;
    }

    Alert.alert("Success", "Workspace initialized successfully!");
    setIsSubmitting(false);

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

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
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>New Workspace</Text>
            <Text style={styles.headerSubtitle}>
              Initialize a collaborative hub for your class.
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            {/* ROW 1: Course Code & Section */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>COURSE CODE</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="CSE 4131"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={courseCode}
                    onChangeText={setCourseCode}
                    autoCapitalize="characters"
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>SECTION</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="A"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={section}
                    onChangeText={setSection}
                    autoCapitalize="characters"
                  />
                </View>
              </View>
            </View>

            {/* FULL WIDTH: Course Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>COURSE NAME</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Mobile App Development"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={courseName}
                  onChangeText={setCourseName}
                />
              </View>
            </View>

            {/* FULL WIDTH: Instructor */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>INSTRUCTOR</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Prof. Ahmed"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={instructor}
                  onChangeText={setInstructor}
                />
                <Ionicons
                  name="person"
                  size={18}
                  color={theme.colors.textSecondary}
                />
              </View>
            </View>

            {/* FULL WIDTH: Department */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>DEPARTMENT</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Computer Science"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={department}
                  onChangeText={setDepartment}
                />
              </View>
            </View>

            {/* FULL WIDTH: University (Fixed from user profile) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>UNIVERSITY</Text>
              <View style={[styles.inputWrapper, { opacity: 0.6 }]}>
                <TextInput
                  style={styles.input}
                  placeholder="SMUCT"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={university}
                  editable={false} // <-- This locks the input!
                />
                <Ionicons
                  name="lock-closed"
                  size={18}
                  color={theme.colors.textSecondary}
                />
              </View>
            </View>

            {/* FULL WIDTH: Term */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>TERM</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Autumn 2026"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={term}
                  onChangeText={setTerm}
                />
              </View>
            </View>

            {/* ROW: Mid-Term Week & Final Week with Native Date Pickers */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>MID-TERM WEEK</Text>
                <TouchableOpacity
                  style={styles.inputWrapper}
                  activeOpacity={0.7}
                  onPress={() => setShowMidtermPicker(true)}
                >
                  <Text
                    style={[
                      styles.input,
                      {
                        color: midtermDate
                          ? theme.colors.textPrimary
                          : theme.colors.textSecondary,
                        paddingTop: Platform.OS === "web" ? 18 : 16,
                      },
                    ]}
                  >
                    {formatDate(midtermDate)}
                  </Text>
                  <Ionicons
                    name="calendar"
                    size={18}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>

                {showMidtermPicker && (
                  <DateTimePicker
                    value={midtermDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                      if (Platform.OS === "android")
                        setShowMidtermPicker(false);
                      if (event.type === "dismissed")
                        setShowMidtermPicker(false);
                      if (date) setMidtermDate(date);
                    }}
                  />
                )}
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>FINAL WEEK</Text>
                <TouchableOpacity
                  style={styles.inputWrapper}
                  activeOpacity={0.7}
                  onPress={() => setShowFinalPicker(true)}
                >
                  <Text
                    style={[
                      styles.input,
                      {
                        color: finalDate
                          ? theme.colors.textPrimary
                          : theme.colors.textSecondary,
                        paddingTop: Platform.OS === "web" ? 18 : 16,
                      },
                    ]}
                  >
                    {formatDate(finalDate)}
                  </Text>
                  <Ionicons
                    name="calendar-clear"
                    size={18}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>

                {showFinalPicker && (
                  <DateTimePicker
                    value={finalDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                      if (Platform.OS === "android") setShowFinalPicker(false);
                      if (event.type === "dismissed") setShowFinalPicker(false);
                      if (date) setFinalDate(date);
                    }}
                  />
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleLaunchHub}
            disabled={isSubmitting}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.launchButton, isSubmitting && { opacity: 0.7 }]}
            >
              {isSubmitting ? (
                <ActivityIndicator color={theme.colors.textPrimary} />
              ) : (
                <>
                  <Text style={styles.launchButtonText}>Launch Course Hub</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color={theme.colors.textPrimary}
                    style={{ marginLeft: 8 }}
                  />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    alignItems: "flex-start",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  backButton: { marginRight: 16, marginTop: 4 },
  headerTextContainer: { flex: 1 },
  headerTitle: {
    fontFamily: theme.typography.heading,
    fontSize: 28,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: theme.typography.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  scrollContent: { paddingHorizontal: theme.spacing.lg, paddingBottom: 40 },
  formContainer: { gap: 20, marginTop: theme.spacing.md },
  row: { flexDirection: "row", gap: 16 },
  inputGroup: { gap: 8 },
  label: {
    fontFamily: theme.typography.bodyBold,
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
  launchButton: {
    width: "100%",
    height: 56,
    borderRadius: theme.shapes.radius.standard,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  launchButtonText: {
    fontFamily: theme.typography.bodyBold,
    color: theme.colors.textPrimary,
    fontSize: 16,
  },
});
