import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "../context/AppContext";
import { ScreenHeader } from "../components/ScreenHeader";
import { DrinkCard } from "../components/DrinkCard";
import { api } from "../services/api";
import { Drink } from "../types";
import { colors } from "../theme";

type RootStackParamList = {
  Main: undefined;
  DrinkDetail: { drinkId: number };
};

export const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const tabNav = useNavigation<NativeStackNavigationProp<any>>();
  const { favoriteIds } = useAppContext();

  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    if (favoriteIds.length === 0) {
      setDrinks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const results = await Promise.all(favoriteIds.map((id) => api.getDrink(id)));
      setDrinks(results);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [favoriteIds]);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHeader
        title="Favorites"
        subtitle={favoriteIds.length > 0 ? `${favoriteIds.length} saved` : undefined}
      />

      {loading && (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
      )}

      {!loading && drinks.length === 0 && (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="heart" size={40} color={colors.border} />
          </View>
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptyText}>
            Tap the heart on any drink to save it here for quick access.
          </Text>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => tabNav.navigate("Finder")}
          >
            <Ionicons name="search-circle" size={20} color="#fff" />
            <Text style={styles.ctaBtnText}>Discover Drinks</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.list}>
        {drinks.map((drink) => (
          <DrinkCard
            key={drink.id}
            drink={drink}
            onPress={() => navigation.navigate("DrinkDetail", { drinkId: drink.id })}
          />
        ))}
      </View>

      <View style={{ height: 90 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  list: {
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.divider,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  ctaBtn: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
