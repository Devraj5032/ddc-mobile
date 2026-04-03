import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "../context/AppContext";
import { ScreenHeader } from "../components/ScreenHeader";
import { ToggleSwitch } from "../components/ToggleSwitch";
import { DrinkCard } from "../components/DrinkCard";
import { api } from "../services/api";
import { Drink } from "../types";

type RootStackParamList = {
  Main: undefined;
  DrinkDetail: { drinkId: number };
};

export const SearchScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isAlcoholic, setIsAlcoholic } = useAppContext();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.length < 2) {
      setResults([]);
      setSearched(false);
      setError(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setSearched(true);
      setError(false);
      try {
        const data = await api.searchDrinks(text, isAlcoholic);
        setResults(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
    >
      <ScreenHeader title="Search" />

      <View style={styles.section}>
        <ToggleSwitch isAlcoholic={isAlcoholic} onToggle={setIsAlcoholic} />
      </View>

      {/* Search bar */}
      <View style={styles.section}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#bbb" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by drink name..."
            value={query}
            onChangeText={handleSearch}
            placeholderTextColor="#bbb"
            autoCapitalize="none"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(""); setResults([]); setSearched(false); }}>
              <Ionicons name="close-circle" size={18} color="#ccc" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Initial empty state */}
      {!searched && !loading && (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={56} color="#e8e8e8" />
          <Text style={styles.emptyTitle}>Find your next drink</Text>
          <Text style={styles.emptyText}>Search by name — try "mojito" or "lemonade"</Text>
        </View>
      )}

      {/* Loading */}
      {loading && <ActivityIndicator size="large" color="#111" style={{ marginTop: 40 }} />}

      {/* Error */}
      {error && (
        <View style={styles.emptyState}>
          <Ionicons name="cloud-offline-outline" size={48} color="#ddd" />
          <Text style={styles.emptyTitle}>Something went wrong</Text>
          <TouchableOpacity onPress={() => handleSearch(query)}>
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* No results */}
      {searched && !loading && !error && results.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="wine-outline" size={48} color="#ddd" />
          <Text style={styles.emptyTitle}>No results for "{query}"</Text>
          <Text style={styles.emptyText}>Try a different name or check your spelling</Text>
        </View>
      )}

      {/* Results */}
      <View style={styles.results}>
        {results.map((drink) => (
          <DrinkCard
            key={drink.id}
            drink={drink}
            compact
            onPress={() => navigation.navigate("DrinkDetail", { drinkId: drink.id })}
          />
        ))}
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#eee",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111",
  },
  results: {
    paddingHorizontal: 24,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#333",
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  retryText: {
    fontSize: 14,
    color: "#111",
    fontWeight: "600",
    marginTop: 8,
  },
});
