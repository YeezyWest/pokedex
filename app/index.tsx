import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Link, Stack } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface Pokemon {
  name: string;
  image: string;
  id: number;
}

const blurhash =
  "|rF?hV%2WCj[ayWD_4f6fQfROBP8j[f6f6fR[fRE_4f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7";

export default function Index() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPokemon();
  }, []);

  const fetchPokemon = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
      const data = await response.json();

      const results = await Promise.allSettled(
        data.results.map(async (p: any, index: number) => {
          try {
            const id = index + 1;
            // Trying a more reliable image source directly from GitHub raw as fallback
            // but official artwork is usually best. HOME is also very good.
            const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
            const fallbackUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`;
            
            return {
              id,
              name: p.name.charAt(0).toUpperCase() + p.name.slice(1),
              image: imageUrl,
              fallback: fallbackUrl,
            };
          } catch (err) {
            return null;
          }
        })
      );

      const detailedPokemonData = results
        .filter((res): res is PromiseFulfilledResult<Pokemon | null> => res.status === "fulfilled")
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
    return pokemon.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [pokemon, search]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Syncing Data...</Text>
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
        <Pressable style={styles.profileCircle}>
          <Ionicons name="person" size={18} color="#4F46E5" />
        </Pressable>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {filteredPokemon.map((p) => (
            <Link key={p.name} href={`/pokemon/${p.name.toLowerCase()}`} asChild>
              <Pressable style={styles.card}>
                <View style={styles.imageBox}>
                  <Image
                    style={styles.image}
                    source={{ uri: p.image }}
                    placeholder={blurhash}
                    contentFit="contain"
                    transition={300}
                    onError={(e) => console.log(`Failed loading ${p.name}:`, e)}
                    cachePolicy="memory-disk"
                  />
                  <Text style={styles.idNumber}>#{String(p.id).padStart(3, "0")}</Text>
                </View>
                <View style={styles.cardFooter}>
                  <Text style={styles.name}>{p.name}</Text>
                  <Ionicons name="chevron-forward" size={14} color="#CBD5E1" />
                </View>
              </Pressable>
            </Link>
          ))}
        </View>
        {filteredPokemon.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No matching assets found</Text>
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
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    letterSpacing: 0.5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4F46E5",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginTop: 4,
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E7FF",
  },
  searchSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
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
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  imageBox: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  image: {
    width: "75%",
    height: "75%",
    zIndex: 2,
  },
  idNumber: {
    position: "absolute",
    top: 10,
    right: 12,
    fontSize: 11,
    fontWeight: "800",
    color: "#E2E8F0",
  },
  cardFooter: {
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: "#9CA3AF",
    fontWeight: "500",
  },
});
