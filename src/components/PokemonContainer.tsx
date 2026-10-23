import { useState, useEffect, useMemo } from 'react';
import type { Pokemon } from '../types'
import { getPokemonList, getRandomPokemon } from "../services/pokeApi";
import SearchBar from './SearchBar';
import HigherLower from './HigherLower';
import GuessPokemon from './GuessPokemon';

export default function PokemonContainer({ gamemode }: { gamemode: string }) {
    const [pokemon, setPokemon] = useState<{name: string, url: string}[]>([]);
    const [onepokemon, setOnePokemon] = useState<Pokemon | null>(null);
    
    const pokemonInfo = useMemo(() => pokemon.map((p) => {
        const id = p.url.split('/').filter(Boolean).pop();
        return {
            name: p.name,
            sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
        };
    }), [pokemon]);

    async function getOnePokemon() {
        try {
            const onePokeData = await getRandomPokemon();
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
            return <GuessPokemon />;
        default:
            return null;
    }
}
