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
    View,
} from "react-native";

interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    other: {
      "official-artwork": {
        front_default: string;
      };
      home: {
        front_default: string;
      };
    };
    front_default: string;
  };
  stats: {
    base_stat: number;
    stat: {
      name: string;
    };
  }[];
  types: {
    type: {
      name: string;
    };
  }[];
  abilities: {
    ability: {
      name: string;
    };
  }[];
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
  fly: "#818CF8",
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
  hp: "Health Points",
  attack: "Attack Power",
  defense: "Defense Level",
  "special-attack": "Spec. Attack",
  "special-defense": "Spec. Defense",
  speed: "Agility Speed",
};

const STAT_SHORT: Record<string, string> = {
  hp: "HP",
  attack: "ATK",
  defense: "DEF",
  "special-attack": "SATK",
  "special-defense": "SDEF",
  speed: "SPD",
};

export default function PokemonDetail() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const router = useRouter();
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPokemonDetails();
  }, [name]);

  const fetchPokemonDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      const data = await response.json();
      setPokemon(data);
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
      </View>
    );
  }

  const mainType = pokemon.types[0].type.name;
  const themeColor = TYPE_COLORS[mainType] || "#4F46E5";
  const artworkUrl = `https://img.pokemondb.net/artwork/large/${pokemon.name}.jpg`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={20} color="#6B7280" />
          </Pressable>
          <View style={styles.headerInfo}>
            <Text style={styles.headerId}>ID: #{String(pokemon.id).padStart(3, "0")}</Text>
            <Text style={styles.headerName}>
              {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
            </Text>
          </View>
          <Pressable style={styles.iconButton}>
            <Ionicons name="share-outline" size={20} color="#6B7280" />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.heroSection}>
            <View style={[styles.imageBg, { backgroundColor: `${themeColor}15` }]}>
              <Image
                style={styles.image}
                source={{ uri: artworkUrl }}
                resizeMode="contain"
                onError={(e) => console.log("Detail image load failed:", e)}
              />
            </View>
            
            <View style={styles.typesRow}>
              {pokemon.types.map((t) => (
                <View
                  key={t.type.name}
                  style={[
                    styles.typeBadge,
                    { backgroundColor: TYPE_COLORS[t.type.name] || "#666" },
                  ]}
                >
                  <Text style={styles.typeText}>
                    {t.type.name.toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Performance Metrics</Text>
              <View style={styles.liveIndicator}>
                <View style={[styles.dot, { backgroundColor: themeColor }]} />
                <Text style={styles.liveText}>Real-time data</Text>
              </View>
            </View>

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
                <Text style={styles.metricLabel}>Skills</Text>
                <Text style={styles.metricValue} numberOfLines={1}>
                  {pokemon.abilities[0].ability.name}
                </Text>
              </View>
            </View>

            <View style={styles.statsList}>
              {pokemon.stats.map((s) => (
                <View key={s.stat.name} style={styles.statRow}>
                  <View style={styles.statLabelContainer}>
                    <Text style={styles.statShortLabel}>{STAT_SHORT[s.stat.name]}</Text>
                    <Text style={styles.statFullLabel}>{STAT_LABELS[s.stat.name]}</Text>
                  </View>
                  <View style={styles.statProgressContainer}>
                    <View style={styles.progressBarBg}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${Math.min(100, (s.base_stat / 180) * 100)}%`,
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
          </View>

          <View style={styles.actionSection}>
            <Pressable style={[styles.mainButton, { backgroundColor: "#4F46E5" }]}>
              <Text style={styles.buttonText}>Generate Intelligence Report</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  headerInfo: {
    alignItems: "center",
  },
  headerId: {
    fontSize: 10,
    fontWeight: "800",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  headerName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: "center",
    paddingVertical: 32,
  },
  imageBg: {
    width: 240,
    height: 240,
    borderRadius: 120,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  image: {
    width: 200,
    height: 200,
  },
  typesRow: {
    flexDirection: "row",
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  typeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  statsCard: {
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  liveText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6B7280",
  },
  metricsGrid: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
  },
  metricDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "#E5E7EB",
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1F2937",
  },
  statsList: {
    gap: 16,
  },
  statRow: {
    marginBottom: 12,
  },
  statLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 8,
  },
  statShortLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#4B5563",
  },
  statFullLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  statProgressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  statNumber: {
    width: 32,
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    textAlign: "right",
  },
  actionSection: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  mainButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
