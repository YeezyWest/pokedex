import { Image } from "expo-image";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

interface Pokemon {
  name: string;
  image: string;
}

const blurhash =
  "|rF?hV%2WCj[ayWD_4f6fQfROBP8j[f6f6fR[fRE_4f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7";

export default function Index() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPokemon();
  }, []);

  const fetchPokemon = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=20");
      const data = await response.json();

      const results = await Promise.allSettled(
        data.results.map(async (p: any) => {
          try {
            const res = await fetch(p.url);
            if (!res.ok) throw new Error(`Failed to fetch details for ${p.name}`);
            const details = await res.json();
            return {
              name: p.name.charAt(0).toUpperCase() + p.name.slice(1),
              image: details.sprites.other["official-artwork"].front_default || details.sprites.front_default,
            };
          } catch (err) {
            console.warn(err);
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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF0000" />
        <Text style={styles.loadingText}>Catching them all...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Pokedex</Text>
      <View style={styles.grid}>
        {pokemon.map((p) => (
          <Link key={p.name} href={`/pokemon/${p.name.toLowerCase()}`} asChild>
            <Pressable style={styles.card}>
              <Image
                style={styles.image}
                source={p.image}
                placeholder={blurhash}
                contentFit="contain"
                transition={1000}
              />
              <Text style={styles.name}>{p.name}</Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
  },
});
