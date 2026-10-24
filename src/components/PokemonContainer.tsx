import { useState, useEffect, useMemo } from 'react';
import type { Pokemon } from '../types'
import { getPokemonList, getRandomPokemon } from "../services/pokeApi";
import SearchBar from './SearchBar';
import HigherLower from './HigherLower';
import GuessPokemon from './GuessPokemon';
import { isInGens } from '../generations';
import { useGenerations } from '../useGenerations';

export default function PokemonContainer({ gamemode }: { gamemode: string }) {
    const [pokemon, setPokemon] = useState<{name: string, url: string}[]>([]);
    const [onepokemon, setOnePokemon] = useState<Pokemon | null>(null);
    const { selected } = useGenerations();

    // Only suggest Pokemon from the selected generations
    const pokemonInfo = useMemo(() => pokemon.flatMap((p) => {
        const id = Number(p.url.split('/').filter(Boolean).pop());
        if(!isInGens(id, selected)) return [];
        return [{
            name: p.name,
            sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
        }];
    }), [pokemon, selected]);

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
                const pokeData = await getPokemonList();
                setPokemon(pokeData.results)
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
