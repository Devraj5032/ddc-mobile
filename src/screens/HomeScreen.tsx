import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Image,
} from "react-native";

const APP_LOGO = require("../../assets/logo.png");
import { FadeIn } from "../components/FadeIn";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "../context/AppContext";
import { ToggleSwitch } from "../components/ToggleSwitch";
import { DrinkCardSmall } from "../components/DrinkCardSmall";
import { DrinkCard } from "../components/DrinkCard";
import { DrinkPlaceholder } from "../components/DrinkPlaceholder";
import { api } from "../services/api";
import { Drink } from "../types";
import { colors } from "../theme";

type RootStackParamList = {
  Main: undefined;
  DrinkDetail: { drinkId: number };
};

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isAlcoholic, setIsAlcoholic } = useAppContext();

  const [quickDrinks, setQuickDrinks] = useState<Drink[]>([]);
  const [popularDrinks, setPopularDrinks] = useState<Drink[]>([]);
  const [forYouDrinks, setForYouDrinks] = useState<Drink[]>([]);
  const [tonightDrink, setTonightDrink] = useState<Drink | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Drink[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadData = useCallback(async () => {
    setError(false);
    try {
      const [quick, popular, tonight, forYou] = await Promise.all([
        api.getQuickDrinks(isAlcoholic),
        api.getPopularDrinks(isAlcoholic),
        api.getRandomDrink(isAlcoholic),
        api.getForYou().catch(() => []),
      ]);
      setQuickDrinks(quick);
      setPopularDrinks(popular);
      setTonightDrink(tonight);
      setForYouDrinks(forYou);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAlcoholic]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const goToDrink = (id: number) => navigation.navigate("DrinkDetail", { drinkId: id });

  // Search handler
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.length < 2) {
      setSearchResults([]);
      setSearchActive(false);
      return;
    }

    setSearchActive(true);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await api.searchDrinks(text, isAlcoholic);
        setSearchResults(data);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchActive(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardDismissMode="on-drag"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* Colored Header Block */}
      <View style={styles.headerBlock}>
        <View style={styles.headerTop}>
          <Image source={APP_LOGO} style={styles.logoImg} resizeMode="contain" />
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Drink Now</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>What are you drinking today?</Text>

        {/* Search Bar inside header */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.6)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search drinks..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="rgba(255,255,255,0.5)"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Toggle */}
      <View style={styles.section}>
        <ToggleSwitch isAlcoholic={isAlcoholic} onToggle={setIsAlcoholic} />
      </View>

      {/* Search results mode */}
      {searchActive ? (
        <View style={styles.section}>
          {searching && (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 30 }} />
          )}
          {!searching && searchResults.length === 0 && searchQuery.length >= 2 && (
            <View style={styles.emptyState}>
              <Ionicons name="wine-outline" size={44} color={colors.border} />
              <Text style={styles.emptyTitle}>No results for "{searchQuery}"</Text>
            </View>
          )}
          {searchResults.map((drink) => (
            <DrinkCard
              key={drink.id}
              drink={drink}
              compact
              onPress={() => goToDrink(drink.id)}
            />
          ))}
        </View>
      ) : (
        <>
          {/* Error */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="cloud-offline-outline" size={44} color={colors.textMuted} />
              <Text style={styles.errorText}>Couldn't load drinks</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={loadData}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {!error && (
            <>
              {/* Featured: Tonight's Pick */}
              {tonightDrink && (
                <FadeIn direction="up" duration={500} style={styles.section}>
                  <Text style={styles.sectionTitle}>Tonight's Pick</Text>
                  <TouchableOpacity
                    style={styles.featuredCard}
                    onPress={() => goToDrink(tonightDrink.id)}
                    activeOpacity={0.85}
                  >
                    {(tonightDrink.image_url || tonightDrink.imageUrl) ? (
                      <Image
                        source={{ uri: (tonightDrink.image_url || tonightDrink.imageUrl) }}
                        style={styles.featuredImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.featuredImage, styles.featuredPlaceholder]}>
                        <Ionicons
                          name={(tonightDrink.is_alcoholic ?? tonightDrink.isAlcoholic) ? "wine" : "cafe"}
                          size={56}
                          color="rgba(255,255,255,0.5)"
                        />
                      </View>
                    )}
                    <View style={styles.featuredOverlay}>
                      <View style={styles.featuredBadge}>
                        <Ionicons name="sparkles" size={12} color="#fff" />
                        <Text style={styles.featuredBadgeText}>Recommended</Text>
                      </View>
                      <Text style={styles.featuredName}>{tonightDrink.name}</Text>
                      <View style={styles.featuredMeta}>
                        <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
                        <Text style={styles.featuredMetaText}>
                          {(tonightDrink.prep_time_minutes ?? tonightDrink.prepTimeMinutes)} min
                        </Text>
                        <Text style={styles.featuredMetaText}> · </Text>
                        <Text style={styles.featuredMetaText}>{tonightDrink.difficulty}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </FadeIn>
              )}

              {/* Quick Drinks */}
              {quickDrinks.length > 0 && (
                <View style={[styles.carouselSection, styles.sectionTinted]}>
                  <View style={styles.sectionHeader}>
                    <View>
                      <Text style={styles.sectionTitle}>Quick Drinks</Text>
                      <Text style={styles.sectionSub}>Ready in under 2 min</Text>
                    </View>
                    <View style={[styles.sectionIcon, { backgroundColor: colors.amberFaint }]}>
                      <Ionicons name="flash" size={18} color={colors.amber} />
                    </View>
                  </View>
                  <FlatList
                    horizontal
                    data={quickDrinks}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item, index }) => (
                      <DrinkCardSmall drink={item} onPress={() => goToDrink(item.id)} index={index} />
                    )}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.carouselContent}
                  />
                </View>
              )}

              {/* Popular */}
              {popularDrinks.length > 0 && (
                <View style={styles.carouselSection}>
                  <View style={styles.sectionHeader}>
                    <View>
                      <Text style={styles.sectionTitle}>Popular</Text>
                      <Text style={styles.sectionSub}>Trending drinks</Text>
                    </View>
                    <View style={[styles.sectionIcon, { backgroundColor: colors.tealFaint }]}>
                      <Ionicons name="trending-up" size={18} color={colors.teal} />
                    </View>
                  </View>
                  <FlatList
                    horizontal
                    data={popularDrinks}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item, index }) => (
                      <DrinkCardSmall drink={item} onPress={() => goToDrink(item.id)} index={index} />
                    )}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.carouselContent}
                  />
                </View>
              )}

              {/* For You */}
              {forYouDrinks.length > 0 && (
                <View style={[styles.carouselSection, styles.sectionTinted]}>
                  <View style={styles.sectionHeader}>
                    <View>
                      <Text style={styles.sectionTitle}>For You</Text>
                      <Text style={styles.sectionSub}>Based on what you've viewed</Text>
                    </View>
                    <View style={[styles.sectionIcon, { backgroundColor: colors.accentFaint }]}>
                      <Ionicons name="sparkles" size={18} color={colors.accent} />
                    </View>
                  </View>
                  <FlatList
                    horizontal
                    data={forYouDrinks.slice(0, 8)}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item, index }) => (
                      <DrinkCardSmall drink={item} onPress={() => goToDrink(item.id)} index={index} />
                    )}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.carouselContent}
                  />
                </View>
              )}
            </>
          )}
        </>
      )}

      <View style={{ height: 90 }} />
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

  // ─── Purple Header Block ───────────────────────
  headerBlock: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  logoImg: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  greeting: {
    fontSize: 21,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.3,
    lineHeight: 25,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    marginTop: 6,
    marginBottom: 14,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#fff",
  },

  // ─── Sections ──────────────────────────────────
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  carouselSection: {
    marginBottom: 8,
    paddingVertical: 16,
  },
  sectionTinted: {
    backgroundColor: colors.primaryFaint,
    borderRadius: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  sectionSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  carouselContent: {
    paddingHorizontal: 20,
    paddingVertical: 6,
  },

  // ─── Featured card ─────────────────────────────
  featuredCard: {
    borderRadius: 20,
    overflow: "hidden",
    height: 210,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  featuredImage: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.primaryDark,
  },
  featuredPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryDark,
  },
  featuredOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 60,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: 8,
  },
  featuredBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  featuredName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
  },
  featuredMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  featuredMetaText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginLeft: 4,
  },

  // ─── Error / Empty ─────────────────────────────
  errorContainer: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textMuted,
  },
});
