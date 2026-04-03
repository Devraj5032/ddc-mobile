import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { FadeIn } from "./FadeIn";
import { Ionicons } from "@expo/vector-icons";
import { Drink } from "../types";
import { DrinkPlaceholder } from "./DrinkPlaceholder";
import { useAppContext } from "../context/AppContext";
import { colors } from "../theme";

interface Props {
  drink: Drink;
  onPress: () => void;
  compact?: boolean;
  index?: number;
}

export const DrinkCard: React.FC<Props> = ({ drink, onPress, compact, index = 0 }) => {
  const { favoriteIds, toggleFavorite } = useAppContext();
  const isFav = favoriteIds.includes(drink.id);
  const thumb = drink.thumbnail_url || drink.thumbnailUrl;
  const img = drink.image_url || drink.imageUrl;
  const hasImage = !!thumb || !!img;
  const isAlc = drink.is_alcoholic ?? drink.isAlcoholic ?? false;
  const prepTime = drink.prep_time_minutes ?? drink.prepTimeMinutes;

  return (
    <FadeIn direction="up" duration={400} delay={index * 100}>
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {hasImage ? (
        <Image
          source={{ uri: (thumb || img)! }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <DrinkPlaceholder size="large" isAlcoholic={isAlc} />
      )}

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {drink.name}
          </Text>
          <TouchableOpacity
            onPress={() => toggleFavorite(drink.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isFav ? "heart" : "heart-outline"}
              size={22}
              color={isFav ? colors.heart : colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {!compact && (
          <Text style={styles.description} numberOfLines={2}>
            {drink.description}
          </Text>
        )}

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={13} color={colors.primary} />
            <Text style={styles.metaText}>{prepTime} min</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="speedometer-outline" size={13} color={colors.teal} />
            <Text style={styles.metaText}>{drink.difficulty}</Text>
          </View>
          {isAlc && (
            <View style={[styles.metaItem, styles.alcoholicBadge]}>
              <Ionicons name="wine" size={12} color={colors.amber} />
              <Text style={[styles.metaText, { color: colors.amber }]}>Alcoholic</Text>
            </View>
          )}
        </View>

        {drink.match_percentage !== undefined && (
          <View style={styles.matchRow}>
            <View
              style={[
                styles.matchBadge,
                drink.match_percentage === 100 && styles.matchPerfect,
              ]}
            >
              <Text style={styles.matchText}>{drink.match_percentage}% match</Text>
            </View>
            {drink.is_one_ingredient_away && drink.missing_ingredients?.[0] && (
              <View style={styles.oneAway}>
                <Ionicons name="flash" size={13} color={colors.amber} />
                <Text style={styles.oneAwayText}>
                  Need: {drink.missing_ingredients[0]}
                </Text>
              </View>
            )}
            {(drink.missing_count ?? 0) > 1 && (
              <Text style={styles.missingText}>
                Missing {drink.missing_count} ingredients
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
    </FadeIn>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    marginBottom: 14,
    marginHorizontal: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: colors.primaryLight,
  },
  image: {
    width: "100%",
    height: 160,
    backgroundColor: colors.border,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  body: {
    padding: 14,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  meta: {
    flexDirection: "row",
    marginTop: 10,
    gap: 14,
    alignItems: "center",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  alcoholicBadge: {
    backgroundColor: "#FFF8E7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 10,
    flexWrap: "wrap",
  },
  matchBadge: {
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  matchPerfect: {
    backgroundColor: "#C8E6C9",
  },
  matchText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: "700",
  },
  oneAway: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  oneAwayText: {
    fontSize: 12,
    color: colors.amber,
    fontWeight: "600",
  },
  missingText: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: "italic",
  },
});
