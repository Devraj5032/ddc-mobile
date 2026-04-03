import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ingredient } from "../types";
import { colors } from "../theme";

interface Props {
  ingredient: Ingredient;
  selected: boolean;
  onToggle: () => void;
}

export const IngredientChip: React.FC<Props> = ({ ingredient, selected, onToggle }) => {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.selected]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, selected && styles.selectedText]}>
        {ingredient.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  text: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
  },
  selectedText: {
    color: "#fff",
  },
});
