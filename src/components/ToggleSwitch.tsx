import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";

interface Props {
  isAlcoholic: boolean;
  onToggle: (val: boolean) => void;
}

export const ToggleSwitch: React.FC<Props> = ({ isAlcoholic, onToggle }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.option, !isAlcoholic && styles.active]}
        onPress={() => onToggle(false)}
      >
        <Ionicons
          name="leaf"
          size={15}
          color={!isAlcoholic ? "#fff" : colors.textMuted}
          style={styles.icon}
        />
        <Text style={[styles.text, !isAlcoholic && styles.activeText]}>
          Non-Alcoholic
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.option, isAlcoholic && styles.active]}
        onPress={() => onToggle(true)}
      >
        <Ionicons
          name="wine"
          size={15}
          color={isAlcoholic ? "#fff" : colors.textMuted}
          style={styles.icon}
        />
        <Text style={[styles.text, isAlcoholic && styles.activeText]}>
          Alcoholic
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.border,
    borderRadius: 14,
    padding: 3,
  },
  option: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  active: {
    backgroundColor: colors.primary,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
  },
  activeText: {
    color: "#fff",
  },
});
