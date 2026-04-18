// app/course/edit/[id].tsx
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { courseService } from "@/src/api/course.service";

export default function EditHubScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Form State
  const [courseCode, setCourseCode] = useState("");
  const [section, setSection] = useState("");
  const [courseName, setCourseName] = useState("");
  const [instructor, setInstructor] = useState("");
  const [department, setDepartment] = useState("");
  const [term, setTerm] = useState("");
  const [university, setUniversity] = useState("");

  const [midtermDate, setMidtermDate] = useState<Date | null>(null);
  const [finalDate, setFinalDate] = useState<Date | null>(null);
  const [showMidtermPicker, setShowMidtermPicker] = useState(false);
  const [showFinalPicker, setShowFinalPicker] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch existing details
  useEffect(() => {
    if (id) fetchHubDetails(id as string);
  }, [id]);

  const fetchHubDetails = async (courseId: string) => {
    setIsLoading(true);
    const { data, error } = await courseService.getCourseDetails(courseId);

    if (error) {
      Alert.alert("Error", error.message);
      router.back();
    } else if (data) {
      const { course_info } = data;
      setCourseCode(course_info.course_code || "");
      setSection(course_info.section || "");
      setCourseName(course_info.course_name || "");
      setInstructor(course_info.instructor_name || "");
      setTerm(course_info.term_offered || "");

      // These are locked based on your mockup
      setUniversity(data.course_info.university_name);
      setDepartment(data.course_info.department);

      if (course_info.midterm_week_start) {
        setMidtermDate(new Date(course_info.midterm_week_start));
      }
      if (course_info.final_week_start) {
        setFinalDate(new Date(course_info.final_week_start));
      }
    }
    setIsLoading(false);
  };

  const formatDisplayDate = (date: Date | null) => {
    if (!date) return "YYYY-MM-DD";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSaveChanges = async () => {
    if (!courseCode || !courseName) {
      Alert.alert("Missing Fields", "Course Code and Name are required.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await courseService.updateCourse(id as string, {
      course_code: courseCode,
      course_name: courseName,
      section: section,
      term_offered: term,
      instructor_name: instructor,
      midterm_week_start: midtermDate ? midtermDate.toISOString() : null,
      final_week_start: finalDate ? finalDate.toISOString() : null,
    });

    if (error) {
      Alert.alert("Update Failed", error.message);
    } else {
      Alert.alert("Success", "Hub details updated successfully!");
      router.back();
    }
    setIsSubmitting(false);
  };

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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header - Using Close Icon per Mockup */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="close" size={28} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Edit Hub Details</Text>
          </View>
          <View style={{ width: 28 }} />{" "}
          {/* Spacer to perfectly center the title */}
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
                    value={section}
                    onChangeText={setSection}
                    autoCapitalize="characters"
                  />
                </View>
              </View>
            </View>

            {/* Course Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>COURSE NAME</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={courseName}
                  onChangeText={setCourseName}
                />
              </View>
            </View>

            {/* Instructor */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>INSTRUCTOR</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
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

            {/* Locked University */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>UNIVERSITY</Text>
              <View style={[styles.inputWrapper, { opacity: 0.6 }]}>
                <TextInput
                  style={styles.input}
                  value={university}
                  editable={false}
                />
                <Ionicons
                  name="lock-closed"
                  size={18}
                  color={theme.colors.textSecondary}
                />
              </View>
            </View>

            {/* ROW: Locked Department & Term */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>DEPARTMENT</Text>
                <View style={[styles.inputWrapper, { opacity: 0.6 }]}>
                  <TextInput
                    style={styles.input}
                    value={department}
                    editable={false}
                  />
                  <Ionicons
                    name="lock-closed"
                    size={18}
                    color={theme.colors.textSecondary}
                  />
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>TERM</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={term}
                    onChangeText={setTerm}
                  />
                </View>
              </View>
            </View>

            {/* ROW: Mid-Term Week & Final Week */}
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
                    {formatDisplayDate(midtermDate)}
                  </Text>
                  <Ionicons
                    name="calendar-outline"
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
                    {formatDisplayDate(finalDate)}
                  </Text>
                  <Ionicons
                    name="calendar-outline"
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
            onPress={handleSaveChanges}
            disabled={isSubmitting}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.saveButton, isSubmitting && { opacity: 0.7 }]}
            >
              {isSubmitting ? (
                <ActivityIndicator color={theme.colors.textPrimary} />
              ) : (
                <>
                  <Text style={styles.saveButtonText}>SAVE CHANGES</Text>
                  <Ionicons
                    name="checkmark-circle"
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
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  backButton: { marginRight: 16 },
  headerTextContainer: { flex: 1, alignItems: "center" },
  headerTitle: {
    fontFamily: theme.typography.heading,
    fontSize: 20,
    color: theme.colors.textPrimary,
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
  saveButton: {
    width: "100%",
    height: 56,
    borderRadius: theme.shapes.radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontFamily: theme.typography.bodyBold,
    color: theme.colors.textPrimary,
    fontSize: 16,
    letterSpacing: 1,
  },
});
