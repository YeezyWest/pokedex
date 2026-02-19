import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
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
    };
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
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  fly: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
};

const STAT_LABELS: Record<string, string> = {
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
        <ActivityIndicator size="large" color="#FF0000" />
      </View>
    );
  }

  const mainType = pokemon.types[0].type.name;
  const themeColor = TYPE_COLORS[mainType] || "#666";

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColor }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerName}>
          {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
        </Text>
        <Text style={styles.headerId}>
          #{String(pokemon.id).padStart(3, "0")}
        </Text>
      </View>

      <View style={styles.imageContainer}>
        <Image
          style={styles.image}
          source={pokemon.sprites.other["official-artwork"].front_default}
          contentFit="contain"
          transition={500}
        />
      </View>

      <View style={styles.contentCard}>
        <View style={styles.typesRow}>
          {pokemon.types.map((t) => (
            <View
              key={t.type.name}
              style={[
                styles.typeBadge,
                { backgroundColor: TYPE_COLORS[t.type.name] },
              ]}
            >
              <Text style={styles.typeText}>
                {t.type.name.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: themeColor }]}>About</Text>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoValue}>{pokemon.weight / 10}kg</Text>
            <Text style={styles.infoLabel}>Weight</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoItem}>
            <Text style={styles.infoValue}>{pokemon.height / 10}m</Text>
            <Text style={styles.infoLabel}>Height</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoItem}>
            <View>
              {pokemon.abilities.slice(0, 2).map((a) => (
                <Text key={a.ability.name} style={styles.infoValue}>
                  {a.ability.name}
                </Text>
              ))}
            </View>
            <Text style={styles.infoLabel}>Abilities</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: themeColor }]}>Base Stats</Text>
        
        {pokemon.stats.map((s) => (
          <View key={s.stat.name} style={styles.statRow}>
            <Text style={styles.statLabel}>{STAT_LABELS[s.stat.name]}</Text>
            <Text style={styles.statValue}>
              {String(s.base_stat).padStart(3, "0")}
            </Text>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(100, (s.base_stat / 200) * 100)}%`,
                    backgroundColor: themeColor,
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    marginLeft: 10,
  },
  headerId: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  imageContainer: {
    alignItems: "center",
    zIndex: 1,
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: -40,
  },
  contentCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    minHeight: 500,
  },
  typesRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    gap: 10,
  },
  typeBadge: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
  },
  typeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 15,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  infoItem: {
    flex: 1,
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: "#ddd",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  infoLabel: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  statLabel: {
    width: 50,
    fontSize: 12,
    fontWeight: "bold",
    color: "#666",
  },
  statValue: {
    width: 40,
    fontSize: 14,
    color: "#333",
    textAlign: "right",
    marginRight: 10,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: "#eee",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
});
