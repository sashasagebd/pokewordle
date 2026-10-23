import { useState, useEffect } from 'react'
import type { Pokemon } from '../types'
import { getRandomPokemon } from '../services/pokeApi'
import GameLayout from './GameLayout'
import Card from './Card'

export default function GuessPokemon() {
    const [ pokemon, setPokemon ] = useState<Pokemon | null>(null);

    useEffect(() => {
        async function getPokemon() {
            const newPokemon = await getRandomPokemon();
            setPokemon(newPokemon);
        }
        getPokemon();
    }, []);
    

    return(
        <GameLayout title="Who's That Pokémon?">
            <Card className="mt-4 w-full max-w-md aspect-square flex items-center justify-center overflow-hidden bg-[radial-gradient(circle,var(--color-gold)_0%,var(--color-warn)_35%,var(--color-poke)_75%)]!">
                {pokemon && (
                    <img src={pokemon.sprites.front_default} alt="Mystery Pokémon" className="w-[85%] h-[85%] pixelated brightness-0 animate-pop" draggable={false}/>
                )}
            </Card>
        </GameLayout>
    )
}
