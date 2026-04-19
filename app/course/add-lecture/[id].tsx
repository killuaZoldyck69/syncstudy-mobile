// app/course/add-lecture/[id].tsx
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
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

interface SubTopicUI {
  id: string;
  title: string;
}

export default function AddLectureScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState("");
  const [termPhase, setTermPhase] = useState<"MID_TERM" | "FINAL_TERM" | "">(
    "",
  );
  const [lectureDate, setLectureDate] = useState<Date | null>(null);
  const [driveLink, setDriveLink] = useState("");

  // Dynamic Sub-Topics State
  const [subTopics, setSubTopics] = useState<SubTopicUI[]>([
    { id: Date.now().toString(), title: "" },
  ]);

  // UI State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPhaseDropdown, setShowPhaseDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addSubTopic = () => {
    setSubTopics((prev) => [...prev, { id: Date.now().toString(), title: "" }]);
  };

  const updateSubTopic = (subId: string, newText: string) => {
    setSubTopics((prev) =>
      prev.map((st) => (st.id === subId ? { ...st, title: newText } : st)),
    );
  };

  const removeSubTopic = (subId: string) => {
    setSubTopics((prev) => prev.filter((st) => st.id !== subId));
  };

  const handleSaveLecture = async () => {
    if (!title || !termPhase || !lectureDate) {
      Alert.alert(
        "Missing Fields",
        "Please provide a title, term phase, and lecture date.",
      );
      return;
    }

    const cleanedSubTopics = subTopics
      .filter((st) => st.title.trim() !== "")
      .map((st) => ({ title: st.title.trim() }));

    setIsSubmitting(true);

    const { error } = await courseService.createCourseTopic(id as string, {
      title,
      term_phase: termPhase,
      lecture_date: lectureDate.toISOString(),
      note_drive_link: driveLink || undefined,
      subTopics: cleanedSubTopics,
    });

    if (error) {
      Alert.alert("Failed to Add Lecture", error.message);
    } else {
      Alert.alert("Success", "Lecture added successfully!");
      router.back();
    }
    setIsSubmitting(false);
  };

  const formatDisplayDate = (date: Date | null) => {
    if (!date) return "Select date";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
            style={styles.iconButton}
          >
            <Ionicons name="close" size={28} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.headerTitle}>Add Lecture</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formGroup}>
            <Text style={styles.label}>TOPIC TITLE</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter topic title"
                placeholderTextColor={theme.colors.textSecondary}
                value={title}
                onChangeText={setTitle}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>TERM PHASE</Text>
            <TouchableOpacity
              style={styles.inputWrapper}
              activeOpacity={0.7}
              onPress={() => setShowPhaseDropdown(true)}
            >
              <Text
                style={[
                  styles.input,
                  {
                    color: termPhase
                      ? theme.colors.textPrimary
                      : theme.colors.textSecondary,
                    paddingTop: Platform.OS === "web" ? 18 : 16,
                  },
                ]}
              >
                {termPhase === "MID_TERM"
                  ? "Mid-Term"
                  : termPhase === "FINAL_TERM"
                    ? "Final-Term"
                    : "Select phase"}
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>LECTURE DATE</Text>
            <TouchableOpacity
              style={styles.inputWrapper}
              activeOpacity={0.7}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color={theme.colors.textSecondary}
                style={{ marginRight: 10 }}
              />
              <Text
                style={[
                  styles.input,
                  {
                    color: lectureDate
                      ? theme.colors.textPrimary
                      : theme.colors.textSecondary,
                    paddingTop: Platform.OS === "web" ? 18 : 16,
                  },
                ]}
              >
                {formatDisplayDate(lectureDate)}
              </Text>
            </TouchableOpacity>

            {showDatePicker ? (
              <DateTimePicker
                value={lectureDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  if (Platform.OS === "android") setShowDatePicker(false);
                  if (event.type === "dismissed") setShowDatePicker(false);
                  if (date) setLectureDate(date);
                }}
              />
            ) : null}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>PDF DRIVE LINK</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="link"
                size={20}
                color={theme.colors.textSecondary}
                style={{ marginRight: 10 }}
              />
              <TextInput
                style={styles.input}
                placeholder="Paste drive link here"
                placeholderTextColor={theme.colors.textSecondary}
                value={driveLink}
                onChangeText={setDriveLink}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.subTopicsContainer}>
            <Text style={styles.sectionTitle}>Sub-Topics Checklist</Text>

            {subTopics.map((sub) => (
              <View key={sub.id} style={styles.subTopicRow}>
                <Ionicons
                  name="apps"
                  size={16}
                  color="#666"
                  style={styles.dragIcon}
                />
                <TextInput
                  style={styles.subTopicInput}
                  placeholder="e.g. Expo CLI Setup"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={sub.title}
                  onChangeText={(text) => updateSubTopic(sub.id, text)}
                />
                <TouchableOpacity
                  onPress={() => removeSubTopic(sub.id)}
                  style={styles.deleteIconBtn}
                >
                  <Ionicons name="trash" size={18} color="#666" />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addSubTopicBtn}
              activeOpacity={0.7}
              onPress={addSubTopic}
            >
              <Ionicons name="add" size={20} color={theme.colors.textPrimary} />
              <Text style={styles.addSubTopicText}>Add Sub-Topic</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSaveLecture}
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
                  <Ionicons
                    name="save-outline"
                    size={20}
                    color={theme.colors.textPrimary}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={showPhaseDropdown}
        transparent={true}
        animationType="fade"
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowPhaseDropdown(false)}
        >
          <View style={styles.dropdownMenu}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setTermPhase("MID_TERM");
                setShowPhaseDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>Mid-Term</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setTermPhase("FINAL_TERM");
                setShowPhaseDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>Final-Term</Text>
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
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  iconButton: { padding: 8 },
  headerTitles: { flex: 1, alignItems: "center" },
  headerTitle: {
    fontFamily: theme.typography.heading,
    fontSize: 20,
    color: theme.colors.textPrimary,
  },

  scrollContent: { paddingHorizontal: theme.spacing.lg, paddingBottom: 40 },

  formGroup: { marginBottom: 20 },
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
  input: {
    flex: 1,
    fontFamily: theme.typography.body,
    fontSize: 16,
    color: theme.colors.textPrimary,
    height: "100%",
  },

  subTopicsContainer: { marginTop: 12 },
  sectionTitle: {
    fontFamily: theme.typography.heading,
    fontSize: 18,
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  subTopicRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.shapes.radius.standard,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 12,
  },
  dragIcon: { marginRight: 12 },
  subTopicInput: {
    flex: 1,
    fontFamily: theme.typography.body,
    fontSize: 16,
    color: theme.colors.textPrimary,
    height: "100%",
  },
  deleteIconBtn: { padding: 8, marginLeft: 8 },

  addSubTopicBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: theme.shapes.radius.standard,
    borderWidth: 1,
    borderColor: "#444",
    borderStyle: "dashed",
    backgroundColor: "transparent",
  },
  addSubTopicText: {
    fontFamily: theme.typography.bodyBold,
    fontSize: 16,
    color: theme.colors.textPrimary,
    marginLeft: 8,
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
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownMenu: {
    width: 250,
    backgroundColor: "#1a1a1c",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  dropdownItem: { paddingVertical: 14, paddingHorizontal: 20 },
  dropdownItemText: {
    fontFamily: theme.typography.bodyMedium,
    fontSize: 16,
    color: theme.colors.textPrimary,
    textAlign: "center",
  },
  menuDivider: { height: 1, backgroundColor: "#2a2a2a", marginVertical: 4 },
});
