import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "ddc_favorites";

export async function getFavorites(): Promise<number[]> {
  const raw = await AsyncStorage.getItem(FAVORITES_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function toggleFavorite(drinkId: number): Promise<boolean> {
  const favs = await getFavorites();
  const index = favs.indexOf(drinkId);
  if (index >= 0) {
    favs.splice(index, 1);
  } else {
    favs.push(drinkId);
  }
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
  return index < 0; // returns true if added, false if removed
}

export async function isFavorite(drinkId: number): Promise<boolean> {
  const favs = await getFavorites();
  return favs.includes(drinkId);
}
