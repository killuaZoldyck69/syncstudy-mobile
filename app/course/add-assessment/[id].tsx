import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar as RNStatusBar,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { theme } from "@/constants/theme";
import { courseService } from "@/src/api/course.service";

const ASSESSMENT_TYPES = ["Quiz", "Assignment", "Presentation"];

export default function AddAssessmentScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState("");
  const [type, setType] = useState(ASSESSMENT_TYPES[0]);
  const [scheduleDate, setScheduleDate] = useState<Date | null>(null);
  const [isTBA, setIsTBA] = useState(false);

  // UI State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date"); // <-- ADDED THIS FOR ANDROID
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateAssessment = async () => {
    if (!title.trim()) {
      Alert.alert("Missing Field", "Please provide an assessment title.");
      return;
    }

    if (!isTBA && !scheduleDate) {
      Alert.alert(
        "Missing Field",
        "Please select a date and time, or toggle 'Date is TBA'.",
      );
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title: title.trim(),
      // 1. Convert "Quiz" to "QUIZ" to satisfy Zod Enum
      type: type.toUpperCase(),
      // 2. Change the key from due_date to date_time to satisfy Zod Object
      date_time: isTBA ? null : scheduleDate?.toISOString() || null,
      is_tba: isTBA,
    };

    const { error } = await courseService.createCourseAssessment(
      id as string,
      payload,
    );

    if (error) {
      Alert.alert("Failed to Add Assessment", error.message);
    } else {
      Alert.alert("Success", "Assessment scheduled successfully!");
      router.back();
    }

    setIsSubmitting(false);
  };

  const formatDisplayDate = (date: Date | null) => {
    if (!date) return "Select Date & Time";
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // --- THE ANDROID DATE+TIME FIX ---
  const handleDateChange = (event: any, selectedDate?: Date) => {
    // If user presses cancel, close the picker
    if (event.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }

    const currentDate = selectedDate || scheduleDate || new Date();

    if (Platform.OS === "android") {
      setShowDatePicker(false);
      setScheduleDate(currentDate);

      // If they just picked a date, wait 50ms and pop open the time clock
      if (pickerMode === "date") {
        setPickerMode("time");
        setTimeout(() => setShowDatePicker(true), 50);
      }
    } else {
      // iOS works perfectly in one step, just save the date
      setScheduleDate(currentDate);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add Assessment</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.iconButton}
          >
            <Ionicons
              name="close"
              size={24}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formGroup}>
            <Text style={styles.label}>ASSESSMENT TITLE</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="e.g., Mid-Term Quiz"
                placeholderTextColor={theme.colors.textSecondary}
                value={title}
                onChangeText={setTitle}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>TYPE</Text>
            <View style={styles.typeSegmentContainer}>
              {ASSESSMENT_TYPES.map((t) => {
                const isActive = type === t;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.typeSegment,
                      isActive && styles.typeSegmentActive,
                    ]}
                    onPress={() => setType(t)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.typeSegmentText,
                        isActive && styles.typeSegmentTextActive,
                      ]}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>SCHEDULE</Text>
            <TouchableOpacity
              style={[styles.inputWrapper, isTBA && styles.inputDisabled]}
              activeOpacity={0.7}
              onPress={() => {
                if (!isTBA) {
                  setPickerMode("date"); // Always start with Date picker on Android
                  setShowDatePicker(true);
                }
              }}
              disabled={isTBA}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color={isTBA ? "#444" : theme.colors.textSecondary}
                style={{ marginRight: 10 }}
              />
              <Text
                style={[
                  styles.input,
                  {
                    color:
                      scheduleDate && !isTBA
                        ? theme.colors.textPrimary
                        : theme.colors.textSecondary,
                    paddingTop: Platform.OS === "web" ? 18 : 16,
                  },
                ]}
              >
                {isTBA ? "To Be Announced" : formatDisplayDate(scheduleDate)}
              </Text>
            </TouchableOpacity>

            {showDatePicker && !isTBA && (
              <DateTimePicker
                value={scheduleDate || new Date()}
                // iOS gets the combined wheel. Android gets single mode (date or time)
                mode={Platform.OS === "ios" ? "datetime" : pickerMode}
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>
              Date is TBA{" "}
              <Text style={styles.switchSubLabel}>(To Be Announced)</Text>
            </Text>
            <Switch
              value={isTBA}
              onValueChange={setIsTBA}
              trackColor={{ true: theme.colors.primary, false: "#444" }}
              thumbColor={"#fff"}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleCreateAssessment}
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
                <Text style={styles.saveButtonText}>Create Assessment</Text>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2a2a2a",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: theme.typography.heading,
    fontSize: 24,
    color: theme.colors.textPrimary,
  },

  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: 16,
    paddingBottom: 40,
  },

  formGroup: { marginBottom: 24 },
  label: {
    fontFamily: theme.typography.bodyBold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: theme.colors.textSecondary,
    marginLeft: 4,
    marginBottom: 8,
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
  inputDisabled: { opacity: 0.5 },
  input: {
    flex: 1,
    fontFamily: theme.typography.body,
    fontSize: 16,
    color: theme.colors.textPrimary,
    height: "100%",
  },

  /* Segmented Control for Type */
  typeSegmentContainer: { flexDirection: "row", gap: 8 },
  typeSegment: {
    flex: 1,
    height: 48,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  typeSegmentActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryGradientEnd,
  },
  typeSegmentText: {
    fontFamily: theme.typography.bodyBold,
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  typeSegmentTextActive: { color: theme.colors.textPrimary },

  /* Switch Row */
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  switchLabel: {
    fontFamily: theme.typography.bodyBold,
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  switchSubLabel: {
    fontFamily: theme.typography.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },

  footer: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  saveButton: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontFamily: theme.typography.bodyBold,
    color: theme.colors.textPrimary,
    fontSize: 16,
  },
});
