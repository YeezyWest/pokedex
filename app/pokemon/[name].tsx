import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useFavourites } from "../../hooks/useFavourites";

interface EvolutionLink {
  name: string;
  id: number;
}

interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  sprites: {
    other: {
      "official-artwork": { front_default: string };
      home: { front_default: string };
    };
    front_default: string;
  };
  stats: { base_stat: number; stat: { name: string } }[];
  types: { type: { name: string } }[];
  abilities: { ability: { name: string }; is_hidden: boolean }[];
  species: { url: string };
}

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
};

const STAT_LABELS: Record<string, string> = {
  hp: "Health",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
};

const STAT_SHORT: Record<string, string> = {
  hp: "HP",
  attack: "ATK",
  defense: "DEF",
  "special-attack": "SATK",
  "special-defense": "SDEF",
  speed: "SPD",
};

function getIdFromUrl(url: string) {
  const parts = url.replace(/\/$/, "").split("/");
  return parseInt(parts[parts.length - 1], 10);
}

function flattenEvolutionChain(chain: any): EvolutionLink[] {
  const result: EvolutionLink[] = [];
  let current = chain;
  while (current) {
    const id = getIdFromUrl(current.species.url);
    result.push({ name: current.species.name, id });
    current = current.evolves_to?.[0] || null;
  }
  return result;
}

export default function PokemonDetail() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const router = useRouter();
  const { isFavourite, toggleFavourite } = useFavourites();

  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const [evolutionChain, setEvolutionChain] = useState<EvolutionLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPokemonDetails();
  }, [name]);

  const fetchPokemonDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      const data: PokemonDetail = await res.json();
      setPokemon(data);

      // Fetch species → evolution chain
      const speciesRes = await fetch(data.species.url);
      const speciesData = await speciesRes.json();
      const evoRes = await fetch(speciesData.evolution_chain.url);
      const evoData = await evoRes.json();
      setEvolutionChain(flattenEvolutionChain(evoData.chain));
    } catch (error) {
      console.error("Error fetching pokemon details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !pokemon) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  const mainType = pokemon.types[0].type.name;
  const themeColor = TYPE_COLORS[mainType] || "#4F46E5";
  const artworkUrl = `https://img.pokemondb.net/artwork/large/${pokemon.name}.jpg`;
  const fav = isFavourite(
    pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)
  );
  const displayName =
    pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={20} color="#6B7280" />
          </Pressable>
          <View style={styles.headerInfo}>
            <Text style={styles.headerId}>
              #{String(pokemon.id).padStart(3, "0")}
            </Text>
            <Text style={styles.headerName}>{displayName}</Text>
          </View>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => toggleFavourite(displayName)}
          >
            <Ionicons
              name={fav ? "heart" : "heart-outline"}
              size={22}
              color={fav ? "#F87171" : "#9CA3AF"}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero image */}
          <View style={styles.heroSection}>
            <View
              style={[
                styles.imageBg,
                { backgroundColor: `${themeColor}18` },
              ]}
            >
              <Image
                style={styles.image}
                source={{ uri: artworkUrl }}
                resizeMode="contain"
              />
            </View>
            <View style={styles.typesRow}>
              {pokemon.types.map((t) => (
                <View
                  key={t.type.name}
                  style={[
                    styles.typeBadge,
                    {
                      backgroundColor: TYPE_COLORS[t.type.name] || "#666",
                    },
                  ]}
                >
                  <Text style={styles.typeText}>
                    {t.type.name.toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Stats card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Performance Metrics</Text>
              <View style={styles.liveChip}>
                <View
                  style={[styles.dot, { backgroundColor: themeColor }]}
                />
                <Text style={styles.liveText}>Live</Text>
              </View>
            </View>

            {/* Physical metrics */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Height</Text>
                <Text style={styles.metricValue}>{pokemon.height / 10} m</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Weight</Text>
                <Text style={styles.metricValue}>{pokemon.weight / 10} kg</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Base XP</Text>
                <Text style={styles.metricValue}>
                  {pokemon.base_experience ?? "—"}
                </Text>
              </View>
            </View>

            {/* Base stats */}
            {pokemon.stats.map((s) => (
              <View key={s.stat.name} style={styles.statRow}>
                <View style={styles.statLabelContainer}>
                  <Text style={styles.statShortLabel}>
                    {STAT_SHORT[s.stat.name]}
                  </Text>
                  <Text style={styles.statFullLabel}>
                    {STAT_LABELS[s.stat.name]}
                  </Text>
                </View>
                <View style={styles.statProgressContainer}>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${Math.min(
                            100,
                            (s.base_stat / 180) * 100
                          )}%`,
                          backgroundColor: themeColor,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.statNumber}>
                    {String(s.base_stat).padStart(3, "0")}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Abilities card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Abilities</Text>
            <View style={styles.abilitiesRow}>
              {pokemon.abilities.map((a) => (
                <View
                  key={a.ability.name}
                  style={[
                    styles.abilityChip,
                    a.is_hidden && styles.abilityChipHidden,
                  ]}
                >
                  <Text
                    style={[
                      styles.abilityChipText,
                      a.is_hidden && styles.abilityChipTextHidden,
                    ]}
                  >
                    {a.ability.name.replace(/-/g, " ")}
                    {a.is_hidden ? " (hidden)" : ""}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Evolution chain card */}
          {evolutionChain.length > 1 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Evolution Chain</Text>
              <View style={styles.evolutionRow}>
                {evolutionChain.map((evo, index) => (
                  <View key={evo.name} style={styles.evolutionItem}>
                    <Pressable
                      onPress={() => router.replace(`/pokemon/${evo.name}`)}
                    >
                      <View
                        style={[
                          styles.evoImageBg,
                          evo.name === pokemon.name && {
                            borderColor: themeColor,
                            borderWidth: 2.5,
                            backgroundColor: `${themeColor}15`,
                          },
                        ]}
                      >
                        <Image
                          style={styles.evoImage}
                          source={{
                            uri: `https://img.pokemondb.net/artwork/large/${evo.name}.jpg`,
                          }}
                          resizeMode="contain"
                        />
                      </View>
                      <Text
                        style={[
                          styles.evoName,
                          evo.name === pokemon.name && {
                            color: themeColor,
                            fontWeight: "800",
                          },
                        ]}
                      >
                        {evo.name.charAt(0).toUpperCase() + evo.name.slice(1)}
                      </Text>
                      <Text style={styles.evoId}>
                        #{String(evo.id).padStart(3, "0")}
                      </Text>
                    </Pressable>
                    {index < evolutionChain.length - 1 && (
                      <View style={styles.evoArrow}>
                        <Ionicons
                          name="arrow-forward"
                          size={18}
                          color="#CBD5E1"
                        />
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* CTA */}
          <View style={styles.actionSection}>
            <Pressable
              style={[styles.mainButton, { backgroundColor: "#4F46E5" }]}
              onPress={() => toggleFavourite(displayName)}
            >
              <Ionicons
                name={fav ? "heart-dislike-outline" : "heart-outline"}
                size={18}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.buttonText}>
                {fav ? "Remove from Favourites" : "Add to Favourites"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#FFFFFF",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  headerInfo: { alignItems: "center" },
  headerId: {
    fontSize: 10,
    fontWeight: "800",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  headerName: { fontSize: 20, fontWeight: "800", color: "#111827" },
  scrollContent: { paddingBottom: 48 },
  heroSection: { alignItems: "center", paddingVertical: 28 },
  imageBg: {
    width: 220,
    height: 220,
    borderRadius: 110,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  image: { width: 190, height: 190 },
  typesRow: { flexDirection: "row", gap: 8 },
  typeBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 14,
  },
  liveChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  liveText: { fontSize: 10, fontWeight: "700", color: "#6B7280" },
  metricsGrid: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  metricItem: { flex: 1, alignItems: "center" },
  metricDivider: { width: 1, backgroundColor: "#E5E7EB" },
  metricLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  metricValue: { fontSize: 15, fontWeight: "800", color: "#1F2937" },
  statRow: { marginBottom: 14 },
  statLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  statShortLabel: { fontSize: 11, fontWeight: "800", color: "#374151" },
  statFullLabel: { fontSize: 11, color: "#9CA3AF", fontWeight: "500" },
  statProgressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", borderRadius: 3 },
  statNumber: {
    width: 32,
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    textAlign: "right",
  },
  abilitiesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  abilityChip: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  abilityChipHidden: {
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  abilityChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4F46E5",
    textTransform: "capitalize",
  },
  abilityChipTextHidden: { color: "#B45309" },
  evolutionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 4,
  },
  evolutionItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  evoImageBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#F3F4F6",
    marginBottom: 4,
  },
  evoImage: { width: 55, height: 55 },
  evoName: {
    fontSize: 11,
    fontWeight: "700",
    color: "#374151",
    textAlign: "center",
  },
  evoId: {
    fontSize: 10,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 1,
  },
  evoArrow: { marginBottom: 20 },
  actionSection: { marginHorizontal: 20, marginTop: 8 },
  mainButton: {
    height: 54,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
