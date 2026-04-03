import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AppContextType {
  isAlcoholic: boolean;
  setIsAlcoholic: (val: boolean) => void;
  favoriteIds: number[];
  toggleFavorite: (id: number) => void;
}

const AppContext = createContext<AppContextType>({
  isAlcoholic: true,
  setIsAlcoholic: () => {},
  favoriteIds: [],
  toggleFavorite: () => {},
});

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAlcoholic, setIsAlcoholicState] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  useEffect(() => {
    AsyncStorage.getItem("ddc_mode").then((val) => {
      if (val !== null) setIsAlcoholicState(val === "true");
    });
    AsyncStorage.getItem("ddc_favorites").then((val) => {
      if (val) setFavoriteIds(JSON.parse(val));
    });
  }, []);

  const setIsAlcoholic = (val: boolean) => {
    setIsAlcoholicState(val);
    AsyncStorage.setItem("ddc_mode", String(val));
  };

  const toggleFavorite = (id: number) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      AsyncStorage.setItem("ddc_favorites", JSON.stringify(next));
      return next;
    });
  };

  return (
    <AppContext.Provider value={{ isAlcoholic, setIsAlcoholic, favoriteIds, toggleFavorite }}>
      {children}
    </AppContext.Provider>
  );
};
