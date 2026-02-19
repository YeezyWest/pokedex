import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "pokedex_favourites";

export function useFavourites() {
  const [favourites, setFavourites] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadFavourites();
  }, []);

  const loadFavourites = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavourites(new Set(JSON.parse(stored)));
      }
    } catch (e) {
      console.warn("Failed to load favourites:", e);
    }
  };

  const toggleFavourite = useCallback(async (name: string) => {
    setFavourites((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...next])).catch(
        console.warn
      );
      return next;
    });
  }, []);

  const isFavourite = useCallback(
    (name: string) => favourites.has(name),
    [favourites]
  );

  return { favourites, toggleFavourite, isFavourite };
}
