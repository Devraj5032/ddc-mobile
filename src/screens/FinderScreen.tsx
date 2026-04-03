import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "../context/AppContext";
import { ScreenHeader } from "../components/ScreenHeader";
import { ToggleSwitch } from "../components/ToggleSwitch";
import { IngredientChip } from "../components/IngredientChip";
import { DrinkCard } from "../components/DrinkCard";
import { api } from "../services/api";
import { Ingredient, Drink } from "../types";
import { colors } from "../theme";

type RootStackParamList = {
  Main: undefined;
  DrinkDetail: { drinkId: number };
};

function groupByType(items: Ingredient[]): Record<string, Ingredient[]> {
  const groups: Record<string, Ingredient[]> = {};
  for (const item of items) {
    const type = item.type || "other";
    if (!groups[type]) groups[type] = [];
    groups[type].push(item);
  }
  return groups;
}

const TYPE_LABELS: Record<string, string> = {
  fruit: "Fruits",
  alcohol: "Spirits",
  mixer: "Mixers",
  juice: "Juices",
  herb: "Herbs",
  sweetener: "Sweeteners",
  dairy: "Dairy",
  other: "Other",
};

export const FinderScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isAlcoholic, setIsAlcoholic } = useAppContext();

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [suggestedIngredients, setSuggestedIngredients] = useState<Ingredient[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [results, setResults] = useState<Drink[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [quickTime, setQuickTime] = useState(false);
  const [maxThree, setMaxThree] = useState(false);

  useEffect(() => {
    api.getIngredients().then(setIngredients).catch(console.error);
    api.getSuggestedIngredients().then(setSuggestedIngredients).catch(console.error);
  }, []);

  const filtered = search
    ? ingredients.filter((i) => {
        const q = search.toLowerCase();
        return (
          i.name.toLowerCase().includes(q) ||
          (i.aliases || []).some((a) => a.toLowerCase().includes(q))
        );
      })
    : ingredients;

  const grouped = groupByType(filtered);
  const showSuggested = !search && selected.length === 0;

  const toggleIngredient = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleGroup = (type: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const findDrinks = useCallback(async () => {
    if (selected.length === 0) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await api.matchDrinks(selected, isAlcoholic, {
        maxTime: quickTime ? 2 : undefined,
        maxIngredients: maxThree ? 3 : undefined,
      });
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [selected, isAlcoholic, quickTime, maxThree]);

  const handleSearchChange = (text: string) => {
    setSearch(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.length >= 2) {
      debounceRef.current = setTimeout(() => {
        api.searchIngredients(text).then((res) => {
          setIngredients((prev) => {
            const ids = new Set(prev.map((i) => i.id));
            return [...prev, ...res.filter((r) => !ids.has(r.id))];
          });
        });
      }, 300);
    }
  };

  const clearAll = () => {
    setSelected([]);
    setResults([]);
    setSearched(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeader title="Find Drinks" subtitle="Select what you have" dark />

        <View style={styles.section}>
          <ToggleSwitch isAlcoholic={isAlcoholic} onToggle={setIsAlcoholic} />
        </View>

        {/* Quick Filters */}
        <View style={styles.section}>
          <View style={styles.quickRow}>
            <TouchableOpacity
              style={[styles.quickChip, quickTime && styles.quickChipActive]}
              onPress={() => setQuickTime(!quickTime)}
            >
              <Ionicons name="flash" size={14} color={quickTime ? "#fff" : colors.amber} />
              <Text style={[styles.quickText, quickTime && styles.quickTextActive]}>
                Under 2 min
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickChip, maxThree && styles.quickChipActive]}
              onPress={() => setMaxThree(!maxThree)}
            >
              <Ionicons name="layers" size={14} color={maxThree ? "#fff" : colors.teal} />
              <Text style={[styles.quickText, maxThree && styles.quickTextActive]}>
                Max 3 items
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={styles.section}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color={colors.primaryLight} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search ingredients..."
              value={search}
              onChangeText={handleSearchChange}
              placeholderTextColor={colors.textMuted}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Suggested */}
        {showSuggested && suggestedIngredients.length > 0 && (
          <View style={styles.section}>
            <View style={styles.groupHeader}>
              <Ionicons name="sparkles" size={16} color={colors.accent} />
              <Text style={styles.groupTitle}>Start with these</Text>
            </View>
            <View style={styles.chips}>
              {suggestedIngredients.map((ing) => (
                <IngredientChip
                  key={ing.id}
                  ingredient={ing}
                  selected={selected.includes(ing.id)}
                  onToggle={() => toggleIngredient(ing.id)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Grouped ingredients */}
        {!showSuggested &&
          Object.entries(grouped).map(([type, items]) => {
            const isCollapsed = collapsedGroups.has(type);
            return (
              <View key={type} style={styles.section}>
                <TouchableOpacity style={styles.groupHeader} onPress={() => toggleGroup(type)}>
                  <Text style={styles.groupTitle}>{TYPE_LABELS[type] || type}</Text>
                  <View style={styles.groupRight}>
                    <View style={styles.countBadge}>
                      <Text style={styles.countText}>{items.length}</Text>
                    </View>
                    <Ionicons
                      name={isCollapsed ? "chevron-down" : "chevron-up"}
                      size={16}
                      color={colors.textMuted}
                    />
                  </View>
                </TouchableOpacity>
                {!isCollapsed && (
                  <View style={styles.chips}>
                    {items.map((ing) => (
                      <IngredientChip
                        key={ing.id}
                        ingredient={ing}
                        selected={selected.includes(ing.id)}
                        onToggle={() => toggleIngredient(ing.id)}
                      />
                    ))}
                  </View>
                )}
              </View>
            );
          })}

        {/* Results */}
        {loading && (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 30 }} />
        )}

        {searched && !loading && results.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="wine-outline" size={48} color={colors.border} />
            <Text style={styles.emptyTitle}>No drinks found</Text>
            <Text style={styles.emptyText}>Try adding more ingredients</Text>
          </View>
        )}

        {results.length > 0 && (
          <View style={[styles.section, { marginTop: 8 }]}>
            <Text style={styles.resultsTitle}>
              {results.length} drink{results.length !== 1 ? "s" : ""} found
            </Text>
            {results.map((drink) => (
              <DrinkCard
                key={drink.id}
                drink={drink}
                onPress={() => navigation.navigate("DrinkDetail", { drinkId: drink.id })}
              />
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating button */}
      {selected.length > 0 && !searched && (
        <View style={styles.floatingContainer}>
          <TouchableOpacity style={styles.floatingBtn} onPress={findDrinks}>
            <Ionicons name="search" size={20} color="#fff" />
            <Text style={styles.floatingBtnText}>
              Find Drinks ({selected.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.floatingClear} onPress={clearAll}>
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {searched && (
        <View style={styles.floatingContainer}>
          <TouchableOpacity style={styles.floatingBtn} onPress={clearAll}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.floatingBtnText}>Start Over</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  quickRow: {
    flexDirection: "row",
    gap: 10,
  },
  quickChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 6,
  },
  quickChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  quickText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  quickTextActive: {
    color: "#fff",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    gap: 6,
  },
  groupTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    flex: 1,
  },
  groupRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  countBadge: {
    backgroundColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  resultsTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 14,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  floatingContainer: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
    flexDirection: "row",
    gap: 10,
  },
  floatingBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  floatingBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  floatingClear: {
    width: 52,
    backgroundColor: colors.card,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.border,
  },
});
