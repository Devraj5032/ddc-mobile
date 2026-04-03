import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme";

interface Props {
  title: string;
  subtitle?: string;
  dark?: boolean;
}

export const ScreenHeader: React.FC<Props> = ({ title, subtitle, dark }) => {
  return (
    <View style={[styles.container, dark && styles.containerDark]}>
      <Text style={[styles.title, dark && styles.titleDark]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, dark && styles.subtitleDark]}>{subtitle}</Text>
      )}
      {dark && <View style={styles.accentLine} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: colors.bg,
  },
  containerDark: {
    backgroundColor: colors.primaryDark,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: 20,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.5,
  },
  titleDark: {
    color: "#fff",
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    marginTop: 4,
  },
  subtitleDark: {
    color: "rgba(255,255,255,0.6)",
  },
  accentLine: {
    width: 40,
    height: 3,
    backgroundColor: colors.accent,
    borderRadius: 2,
    marginTop: 12,
  },
});
