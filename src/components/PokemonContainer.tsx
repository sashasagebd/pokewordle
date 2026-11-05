import { useState, useEffect, useMemo } from 'react';
import type { Pokemon } from '../types'
import { getPokemonList, spriteUrl } from "../services/pokeApi";
import SearchBar from './SearchBar';
import HigherLower from './HigherLower';
import GuessPokemon from './GuessPokemon';
import { isInGens } from '../generations';
import { useGenerations } from '../useGenerations';

export default function PokemonContainer({ gamemode }: { gamemode: string }) {
    // The list for autocomplete; the games themselves are on the server
    const [pokemon, setPokemon] = useState<Pokemon[]>([]);
    const { selected } = useGenerations();

    // Only suggest Pokemon from the selected generations
    const pokemonInfo = useMemo(() => pokemon
        .filter(p => isInGens(p.id, selected))
        .map(p => ({ name: p.name, sprite: spriteUrl(p.id) })),
    [pokemon, selected]);

    useEffect(() => {
        async function getData() {
            try {
                setPokemon(await getPokemonList());
            } catch (err) {
                console.error(err);
            }
        }
        getData();
    }, []);

    switch (gamemode) {
        case "pokewordle":
            return <SearchBar pokemonInfo={pokemonInfo} />;
        case "higherlower":
            return <HigherLower />;
        case "guesspokemon":
            return <GuessPokemon pokemonInfo={pokemonInfo} />;
        default:
            return null;
    }
}
