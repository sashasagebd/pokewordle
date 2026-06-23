import { useState, useEffect, useMemo } from 'react';
import type { Pokemon, PokemonInfo } from '../types'
import { getPokemonList, getPokemon, getRandomPokemon } from "../services/pokeApi";
import SearchBar from './SearchBar';
import HigherLower from './HigherLower';
import GuessPokemon from './GuessPokemon';

export default function PokemonContainer({ gamemode }: { gamemode: string }) {
    const [loadingList, setLoadingList] = useState<boolean>(true);
    const [loadingOne, setLoadingOne] = useState<boolean>(true);
    const [pokemon, setPokemon] = useState<{name: string, url: string}[]>([]);
    const [onepokemon, setOnePokemon] = useState<Pokemon | null>(null);
    
    const pokemonInfo: PokemonInfo[] = pokemon.map((p) => {
        const id = p.url.split('/').filter(Boolean).pop();
        return {
            name: p.name,
            sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
        };
    });

    useEffect(() => {
        async function getData() {
            try {
                const pokeData = await getPokemonList();
                setPokemon(pokeData.results)
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingList(false);
            }
        }
        getData();
        
        async function getOnePokemon() {
            try {
                const onePokeData = await getRandomPokemon();
                setOnePokemon(onePokeData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingOne(false);
            }
        }
        getOnePokemon();
    }, []);

    console.log(pokemonInfo);


    console.log(pokemon);
    console.log(onepokemon)

    return (
        <>
            {(() => {
                switch (gamemode) {
                    case "pokewordle":
                        return <SearchBar targetPokemon={onepokemon} pokemonInfo={pokemonInfo} />;
                    case "higherlower":
                        return <HigherLower starterPokemon={onepokemon} />;
                    case "guesspokemon":
                        return <GuessPokemon />;
                    default:
                        return null;
                }
            })()}
        </>
    )
}