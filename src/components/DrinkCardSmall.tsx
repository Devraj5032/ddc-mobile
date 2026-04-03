import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { FadeIn } from "./FadeIn";
import { Ionicons } from "@expo/vector-icons";
import { Drink } from "../types";
import { DrinkPlaceholder } from "./DrinkPlaceholder";
import { colors } from "../theme";

interface Props {
  drink: Drink;
  onPress: () => void;
  index?: number;
}

export const DrinkCardSmall: React.FC<Props> = ({ drink, onPress, index = 0 }) => {
  const thumb = drink.thumbnail_url || drink.thumbnailUrl;
  const img = drink.image_url || drink.imageUrl;
  const hasImage = !!thumb || !!img;

  return (
    <FadeIn direction="right" duration={400} delay={index * 80}>
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {hasImage ? (
        <Image
          source={{ uri: (thumb || img)! }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <DrinkPlaceholder size="small" isAlcoholic={drink.is_alcoholic ?? drink.isAlcoholic} />
      )}
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {drink.name}
        </Text>
        <View style={styles.meta}>
          <Ionicons name="time-outline" size={12} color={colors.textMuted} />
          <Text style={styles.metaText}>{drink.prep_time_minutes ?? drink.prepTimeMinutes} min</Text>
        </View>
      </View>
    </TouchableOpacity>
    </FadeIn>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 160,
    backgroundColor: colors.card,
    borderRadius: 16,
    marginRight: 12,
    marginBottom: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 120,
    backgroundColor: colors.border,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  body: {
    padding: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  metaText: {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 3,
  },
});
