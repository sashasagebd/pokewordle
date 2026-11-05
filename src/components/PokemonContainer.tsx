import { useState, useEffect, useMemo } from 'react';
import type { Pokemon } from '../types'
import { getPokemonList, getRandomPokemon, spriteUrl } from "../services/pokeApi";
import SearchBar from './SearchBar';
import HigherLower from './HigherLower';
import GuessPokemon from './GuessPokemon';
import { isInGens } from '../generations';
import { useGenerations } from '../useGenerations';

export default function PokemonContainer({ gamemode }: { gamemode: string }) {
    const [pokemon, setPokemon] = useState<Pokemon[]>([]);
    const [onepokemon, setOnePokemon] = useState<Pokemon | null>(null);
    const { selected } = useGenerations();

    // Only suggest Pokemon from the selected generations
    const pokemonInfo = useMemo(() => pokemon
        .filter(p => isInGens(p.id, selected))
        .map(p => ({ name: p.name, sprite: spriteUrl(p.id) })),
    [pokemon, selected]);

    async function getOnePokemon() {
        try {
            const onePokeData = await getRandomPokemon(selected);
            setOnePokemon(onePokeData);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        async function getData() {
            try {
                setPokemon(await getPokemonList());
            } catch (err) {
                console.error(err);
            }
        }
        getData();
        getOnePokemon();
    }, []);

    switch (gamemode) {
        case "pokewordle":
            return <SearchBar targetPokemon={onepokemon} pokemonInfo={pokemonInfo} onNewGame={getOnePokemon} />;
        case "higherlower":
            return <HigherLower starterPokemon={onepokemon} />;
        case "guesspokemon":
            return <GuessPokemon starterPokemon={onepokemon} pokemonInfo={pokemonInfo} />;
        default:
            return null;
    }
}
