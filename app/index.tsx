import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

interface Pokemon {
  name: string;
  url: string;
}

export default function Index() {
const [pokemon, setPokemon] = useState<Pokemon[]>([]);

useEffect(() => {
  fetchPokemon();
}, []);

const fetchPokemon = async () => {
  try {
    const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=10");
    const data = await response.json();

//fetch detailed info for each pokemon in parallel
  const detailedPokemonData = await Promise.all(
    data.results.map(async (pokemon: any) => {
      const res = await fetch(pokemon.url);
      const details = await res.json();
      return {
        name: pokemon.name,
        url: pokemon.url,
        image: details.sprites.front_default,
      };
    })
  );

    console.log(detailedPokemonData);
    setPokemon(data.results);
  } catch (error) {
    console.log(error);
  }
};
  return (
    <ScrollView>
     {pokemon.map((pokemon) => (
      <View key={pokemon.name}>
        <Text>{pokemon.name}</Text>
      </View>
     ))}
    </ScrollView>
  );
}
