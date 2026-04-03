import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "../context/AppContext";
import { api } from "../services/api";
import { Drink } from "../types";
import { colors } from "../theme";

type RouteParams = {
  DrinkDetail: { drinkId: number };
};

export const DrinkDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, "DrinkDetail">>();
  const navigation = useNavigation();
  const { favoriteIds, toggleFavorite } = useAppContext();

  const [drink, setDrink] = useState<Drink | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const isFav = drink ? favoriteIds.includes(drink.id) : false;

  useEffect(() => {
    api
      .getDrink(route.params.drinkId)
      .then(setDrink)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [route.params.drinkId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!drink) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.border} />
        <Text style={{ color: colors.textMuted, marginTop: 12, fontSize: 16 }}>
          Drink not found
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.primary, fontWeight: "600" }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const tags = drink.drink_tag_map?.map((t) => t.drink_tags?.name).filter(Boolean) || [];
  const steps = [...(drink.drink_steps || [])].sort((a, b) => a.step_number - b.step_number);
  const ingredients = drink.drink_ingredients || [];
  const allImages = (drink.images && drink.images.length > 0)
    ? drink.images
    : drink.image_url
    ? [drink.image_url]
    : [];

  const screenWidth = Dimensions.get("window").width;

  const onCarouselScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
    setActiveIndex(idx);
  };

  const isAlc = drink.is_alcoholic ?? drink.isAlcoholic ?? false;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Image Carousel */}
      <View style={styles.imageContainer}>
        {allImages.length > 0 ? (
          <>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onCarouselScroll}
              scrollEventThrottle={16}
            >
              {allImages.map((uri, i) => (
                <Image
                  key={i}
                  source={{ uri }}
                  style={[styles.image, { width: screenWidth }]}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
            {allImages.length > 1 && (
              <View style={styles.dots}>
                {allImages.map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, i === activeIndex && styles.dotActive]}
                  />
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={[styles.image, styles.placeholderImage, { width: screenWidth }]}>
            <Ionicons
              name={isAlc ? "wine" : "cafe"}
              size={64}
              color="rgba(255,255,255,0.4)"
            />
          </View>
        )}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleFavorite(drink.id)} style={styles.iconBtn}>
            <Ionicons
              name={isFav ? "heart" : "heart-outline"}
              size={22}
              color={isFav ? colors.heart : "#fff"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{drink.name}</Text>
        <Text style={styles.description}>{drink.description}</Text>

        {/* Meta */}
        <View style={styles.metaRow}>
          <View style={styles.metaCard}>
            <Ionicons name="time-outline" size={22} color={colors.primary} />
            <Text style={styles.metaValue}>{drink.prep_time_minutes ?? drink.prepTimeMinutes} min</Text>
            <Text style={styles.metaLabel}>Prep time</Text>
          </View>
          <View style={styles.metaCard}>
            <Ionicons name="speedometer-outline" size={22} color={colors.teal} />
            <Text style={styles.metaValue}>{drink.difficulty}</Text>
            <Text style={styles.metaLabel}>Difficulty</Text>
          </View>
          <View style={styles.metaCard}>
            <Ionicons
              name={isAlc ? "wine" : "leaf"}
              size={22}
              color={isAlc ? colors.amber : colors.success}
            />
            <Text style={styles.metaValue}>{isAlc ? "Yes" : "No"}</Text>
            <Text style={styles.metaLabel}>Alcohol</Text>
          </View>
        </View>

        {/* Tags */}
        {tags.length > 0 && (
          <View style={styles.tags}>
            {tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Ingredients */}
        <Text style={styles.sectionTitle}>Ingredients</Text>
        <View style={styles.ingredientsList}>
          {ingredients.map((ing, idx) => (
            <View
              key={idx}
              style={[
                styles.ingredientRow,
                idx === ingredients.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View style={styles.ingredientLeft}>
                <View style={styles.dot} />
                <Text style={styles.ingredientName}>{ing.ingredients?.name}</Text>
                {ing.is_optional && (
                  <Text style={styles.optionalBadge}>optional</Text>
                )}
              </View>
              {ing.quantity && (
                <Text style={styles.ingredientQty}>{ing.quantity}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Steps */}
        <Text style={styles.sectionTitle}>How to Make</Text>
        <View style={styles.stepsList}>
          {steps.map((step, idx) => (
            <View key={step.step_number} style={styles.stepRow}>
              <View style={styles.stepLeft}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{step.step_number}</Text>
                </View>
                {idx < steps.length - 1 && <View style={styles.stepLine} />}
              </View>
              <Text style={styles.stepInstruction}>{step.instruction}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.bg,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 300,
    backgroundColor: colors.primaryDark,
  },
  placeholderImage: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryDark,
  },
  dots: {
    position: "absolute",
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  dotActive: {
    backgroundColor: "#fff",
    width: 20,
  },
  topBar: {
    position: "absolute",
    top: 48,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  name: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 8,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: "row",
    marginTop: 24,
    gap: 10,
  },
  metaCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaValue: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    textTransform: "capitalize",
  },
  metaLabel: {
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 20,
    gap: 8,
  },
  tag: {
    backgroundColor: colors.divider,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: colors.text,
    marginTop: 32,
    marginBottom: 16,
  },
  ingredientsList: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  ingredientLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 12,
  },
  ingredientName: {
    fontSize: 15,
    color: colors.text,
  },
  optionalBadge: {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 8,
    fontStyle: "italic",
  },
  ingredientQty: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  stepsList: {
    gap: 0,
  },
  stepRow: {
    flexDirection: "row",
    minHeight: 56,
  },
  stepLeft: {
    alignItems: "center",
    width: 36,
    marginRight: 14,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  stepInstruction: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    paddingTop: 4,
    paddingBottom: 16,
  },
});
