import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FadeIn } from "../components/FadeIn";
import { useAuth } from "../context/AuthContext";
import { useAppContext } from "../context/AppContext";
import { ScreenHeader } from "../components/ScreenHeader";
import { api } from "../services/api";
import { colors } from "../theme";

type EditableField = "name" | "phone" | "dateOfBirth" | "bio" | null;

export const AccountScreen: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const { isAlcoholic, setIsAlcoholic } = useAppContext();

  const [editing, setEditing] = useState<EditableField>(null);
  const [fieldValue, setFieldValue] = useState("");
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const startEdit = (field: EditableField) => {
    if (!field) return;
    setEditing(field);
    setFieldValue(
      field === "name" ? user.name || "" :
      field === "phone" ? user.phone || "" :
      field === "dateOfBirth" ? user.dateOfBirth || "" :
      field === "bio" ? user.bio || "" : ""
    );
  };

  const saveField = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const updated = await api.updateProfile({
        email: user.email,
        [editing]: fieldValue.trim(),
      });
      updateUser(updated);
      setEditing(null);
    } catch {
      Alert.alert("Error", "Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditing(null);
    setFieldValue("");
  };

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: logout },
    ]);
  };

  const displayName = user.name || "Drink Lover";
  const initial = displayName.charAt(0).toUpperCase();

  const profileFields = [
    {
      key: "name" as EditableField,
      label: "Name",
      value: user.name,
      placeholder: "Enter your name",
      icon: "person-outline" as const,
      iconBg: "#F3E8FF",
      iconColor: colors.primary,
    },
    {
      key: "phone" as EditableField,
      label: "Phone",
      value: user.phone,
      placeholder: "Enter phone number",
      icon: "call-outline" as const,
      iconBg: "#E8F5E9",
      iconColor: colors.success,
      keyboardType: "phone-pad" as const,
    },
    {
      key: "dateOfBirth" as EditableField,
      label: "Date of Birth",
      value: user.dateOfBirth,
      placeholder: "DD/MM/YYYY",
      icon: "calendar-outline" as const,
      iconBg: "#FFF3E0",
      iconColor: colors.amber,
    },
    {
      key: "bio" as EditableField,
      label: "Bio",
      value: user.bio,
      placeholder: "Tell us about yourself",
      icon: "chatbubble-outline" as const,
      iconBg: "#E3F2FD",
      iconColor: colors.sky,
      multiline: true,
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardDismissMode="on-drag"
    >
      <ScreenHeader title="Account" />

      {/* Profile Card */}
      <FadeIn direction="up" duration={400} style={styles.section}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.displayName}>{displayName}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
        </View>
      </FadeIn>

      {/* Personal Details */}
      <FadeIn direction="up" duration={400} delay={100} style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Details</Text>
        <View style={styles.menuCard}>
          {profileFields.map((field, idx) => (
            <View key={field.key}>
              {idx > 0 && <View style={styles.divider} />}

              {editing === field.key ? (
                <View style={styles.editContainer}>
                  <View style={styles.editHeader}>
                    <Text style={styles.editLabel}>{field.label}</Text>
                    <View style={styles.editActions}>
                      <TouchableOpacity onPress={saveField} disabled={saving}>
                        <Ionicons name="checkmark-circle" size={28} color={colors.success} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={cancelEdit}>
                        <Ionicons name="close-circle" size={28} color={colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TextInput
                    style={[styles.editInput, field.multiline && styles.editInputMultiline]}
                    value={fieldValue}
                    onChangeText={setFieldValue}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.textMuted}
                    autoFocus
                    multiline={field.multiline}
                    keyboardType={field.keyboardType || "default"}
                    returnKeyType={field.multiline ? "default" : "done"}
                    onSubmitEditing={field.multiline ? undefined : saveField}
                    maxLength={field.key === "bio" ? 200 : field.key === "phone" ? 15 : 50}
                  />
                  {field.key === "bio" && (
                    <Text style={styles.charCount}>{fieldValue.length}/200</Text>
                  )}
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => startEdit(field.key)}
                >
                  <View style={styles.menuLeft}>
                    <View style={[styles.menuIcon, { backgroundColor: field.iconBg }]}>
                      <Ionicons name={field.icon} size={20} color={field.iconColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.menuLabel}>{field.label}</Text>
                      <Text style={[
                        styles.menuValue,
                        !field.value && styles.menuValueEmpty,
                      ]}>
                        {field.value || field.placeholder}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="pencil" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </FadeIn>

      {/* Preferences */}
      <FadeIn direction="up" duration={400} delay={200} style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setIsAlcoholic(!isAlcoholic)}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: "#FFF3E0" }]}>
                <Ionicons name="wine" size={20} color={colors.amber} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuLabel}>Drink Mode</Text>
                <Text style={styles.menuValue}>
                  {isAlcoholic ? "Showing alcoholic drinks" : "Showing non-alcoholic"}
                </Text>
              </View>
            </View>
            <View style={[styles.toggle, isAlcoholic && styles.toggleActive]}>
              <View style={[styles.toggleDot, isAlcoholic && styles.toggleDotActive]} />
            </View>
          </TouchableOpacity>
        </View>
      </FadeIn>

      {/* About */}
      <FadeIn direction="up" duration={400} delay={300} style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.menuCard}>
          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: "#F3E8FF" }]}>
                <Ionicons name="information-circle" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.menuLabel}>Version</Text>
                <Text style={styles.menuValue}>1.0.0 — Phase 1</Text>
              </View>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: "#E3F2FD" }]}>
                <Ionicons name="heart" size={20} color={colors.sky} />
              </View>
              <View>
                <Text style={styles.menuLabel}>Made with love</Text>
                <Text style={styles.menuValue}>Daily Drink Companion</Text>
              </View>
            </View>
          </View>
        </View>
      </FadeIn>

      {/* Logout */}
      <FadeIn direction="up" duration={400} delay={400} style={styles.section}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.accent} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </FadeIn>

      <View style={{ height: 90 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },

  // Profile
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
  },
  profileInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  email: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Menu cards
  menuCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  menuValue: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 1,
  },
  menuValueEmpty: {
    color: colors.textMuted,
    fontStyle: "italic",
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginHorizontal: 16,
  },

  // Inline edit
  editContainer: {
    padding: 16,
  },
  editHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  editLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  editActions: {
    flexDirection: "row",
    gap: 6,
  },
  editInput: {
    backgroundColor: colors.bg,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  editInputMultiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: "right",
    marginTop: 4,
  },

  // Toggle
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#fff",
  },
  toggleDotActive: {
    alignSelf: "flex-end",
  },

  // Logout
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: "#FFE0E0",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.accent,
  },
});
