import { Ionicons } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFavourites } from "../hooks/useFavourites";

interface Pokemon {
  name: string;
  image: string;
  id: number;
  types: string[];
}

const ALL_TYPES = [
  "all",
  "fire",
  "water",
  "grass",
  "electric",
  "psychic",
  "ice",
  "dragon",
  "dark",
  "fairy",
  "normal",
  "fighting",
  "flying",
  "poison",
  "ground",
  "rock",
  "bug",
  "ghost",
  "steel",
];

const TYPE_COLORS: Record<string, string> = {
  normal: "#94A3B8",
  fire: "#F87171",
  water: "#60A5FA",
  electric: "#FACC15",
  grass: "#4ADE80",
  ice: "#99E6E6",
  fighting: "#E11D48",
  poison: "#A855F7",
  ground: "#D97706",
  flying: "#818CF8",
  psychic: "#F472B6",
  bug: "#84CC16",
  rock: "#78350F",
  ghost: "#6366F1",
  dragon: "#4F46E5",
  dark: "#1F2937",
  steel: "#475569",
  fairy: "#EC4899",
  all: "#4F46E5",
};

export default function Index() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("all");
  const { isFavourite, toggleFavourite } = useFavourites();

  useEffect(() => {
    fetchPokemon();
  }, []);

  const fetchPokemon = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://pokeapi.co/api/v2/pokemon?limit=151"
      );
      const data = await response.json();

      const results = await Promise.allSettled(
        data.results.map(async (p: any, index: number) => {
          try {
            const id = index + 1;
            const detailRes = await fetch(
              `https://pokeapi.co/api/v2/pokemon/${id}`
            );
            const detail = await detailRes.json();
            return {
              id,
              name: p.name.charAt(0).toUpperCase() + p.name.slice(1),
              image: `https://img.pokemondb.net/artwork/large/${p.name}.jpg`,
              types: detail.types.map((t: any) => t.type.name),
            };
          } catch (err) {
            return null;
          }
        })
      );

      const detailedPokemonData = results
        .filter(
          (res): res is PromiseFulfilledResult<Pokemon | null> =>
            res.status === "fulfilled"
        )
        .map((res) => res.value)
        .filter((p): p is Pokemon => p !== null);

      setPokemon(detailedPokemonData);
    } catch (error) {
      console.error("Error fetching pokemon list:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPokemon = useMemo(() => {
    return pokemon.filter((p) => {
      const nameMatch = p.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const typeMatch =
        activeType === "all" || p.types.includes(activeType);
      return nameMatch && typeMatch;
    });
  }, [pokemon, search, activeType]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Syncing Data...</Text>
        <Text style={styles.loadingSubtext}>Fetching all 151 records</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Pokemon Management</Text>
          <Text style={styles.headerTitle}>Asset Collection</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{filteredPokemon.length}</Text>
          </View>
          <Pressable style={styles.profileCircle}>
            <Ionicons name="person" size={18} color="#4F46E5" />
          </Pressable>
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#9CA3AF"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search assets..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="#CBD5E1" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Type filter bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {ALL_TYPES.map((type) => {
          const isActive = activeType === type;
          const color = TYPE_COLORS[type];
          return (
            <TouchableOpacity
              key={type}
              onPress={() => setActiveType(type)}
              style={[
                styles.filterPill,
                isActive && { backgroundColor: color, borderColor: color },
              ]}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.filterPillText,
                  isActive && styles.filterPillTextActive,
                ]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Grid */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {filteredPokemon.map((p) => {
            const fav = isFavourite(p.name);
            const primaryType = p.types[0];
            const typeColor = TYPE_COLORS[primaryType] || "#94A3B8";
            return (
              <Link
                key={p.name}
                href={`/pokemon/${p.name.toLowerCase()}`}
                asChild
              >
                <Pressable style={styles.card}>
                  {/* Type-coloured banner at top */}
                  <View
                    style={[
                      styles.cardBanner,
                      { backgroundColor: `${typeColor}18` },
                    ]}
                  >
                    <Text style={styles.idNumber}>
                      #{String(p.id).padStart(3, "0")}
                    </Text>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation?.();
                        toggleFavourite(p.name);
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name={fav ? "heart" : "heart-outline"}
                        size={18}
                        color={fav ? "#F87171" : "#CBD5E1"}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.imageBox}>
                    <Image
                      style={styles.image}
                      source={{ uri: p.image }}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.cardFooter}>
                    <Text style={styles.name}>{p.name}</Text>
                    <View style={styles.typePills}>
                      {p.types.slice(0, 2).map((t) => (
                        <View
                          key={t}
                          style={[
                            styles.typePill,
                            { backgroundColor: `${TYPE_COLORS[t]}22` },
                          ]}
                        >
                          <Text
                            style={[
                              styles.typePillText,
                              { color: TYPE_COLORS[t] },
                            ]}
                          >
                            {t}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </Pressable>
              </Link>
            );
          })}
        </View>
        {filteredPokemon.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No matching assets</Text>
            <Text style={styles.emptySubtext}>
              Try a different name or type
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
  },
  loadingSubtext: {
    marginTop: 4,
    fontSize: 13,
    color: "#9CA3AF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#4F46E5",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  countBadge: {
    backgroundColor: "#EEF2FF",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#4F46E5",
  },
  profileCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E7FF",
  },
  searchSection: {
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
  },
  filterScroll: {
    maxHeight: 50,
    marginBottom: 14,
  },
  filterContent: {
    paddingHorizontal: 24,
    gap: 8,
    alignItems: "center",
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
  },
  filterPillTextActive: {
    color: "#FFFFFF",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  cardBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  idNumber: {
    fontSize: 11,
    fontWeight: "800",
    color: "#94A3B8",
  },
  imageBox: {
    width: "100%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 4,
  },
  image: {
    width: "85%",
    height: "85%",
  },
  cardFooter: {
    padding: 10,
    paddingTop: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 5,
  },
  typePills: {
    flexDirection: "row",
    gap: 4,
    flexWrap: "wrap",
  },
  typePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typePillText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 60,
    gap: 6,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6B7280",
  },
  emptySubtext: {
    fontSize: 13,
    color: "#9CA3AF",
  },
});
