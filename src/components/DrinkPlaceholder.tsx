import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  size?: "small" | "large";
  isAlcoholic?: boolean;
}

export const DrinkPlaceholder: React.FC<Props> = ({
  size = "small",
  isAlcoholic = true,
}) => {
  const isLarge = size === "large";
  const icon = isAlcoholic ? "wine" : "cafe";

  return (
    <View style={[styles.container, isLarge ? styles.large : styles.small]}>
      <View style={styles.circle}>
        <Ionicons name={icon} size={isLarge ? 44 : 28} color="#d4a0ff" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f3e8ff",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  small: {
    height: 120,
  },
  large: {
    height: 160,
  },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#ede0ff",
    alignItems: "center",
    justifyContent: "center",
  },
});
