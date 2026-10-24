import { useState, useEffect } from 'react'
import type { GuessPokemonProps, Pokemon } from '../types'
import GameLayout from './GameLayout'
import Card from './Card'
import Button from './Button'
import PokemonSearch from './PokemonSearch'
import StreakBadge from './StreakBadge'
import WrongFlash from './WrongFlash'
import pokeBall from '../assets/pokeball.svg'
import { useGenerations } from '../useGenerations'
import { usePokemonQueue } from '../usePokemonQueue'
import { useBestScore } from '../useBestScore'

// null while guessing; set once the Pokemon has been revealed
type Result = { outcome: "correct" | "wrong", guess: string } | { outcome: "gaveUp" } | null;

export default function GuessPokemon({ starterPokemon, pokemonInfo }: GuessPokemonProps) {
    const [ pokemon, setPokemon ] = useState<Pokemon | null>(starterPokemon);
    const [ result, setResult ] = useState<Result>(null);
    const [ streak, setStreak ] = useState<number>(0);
    const { best, recordStreak } = useBestScore("guesspokemon");
    const [ error, setError ] = useState<string>('');
    const [ wrongFlash, setWrongFlash ] = useState<number>(0);
    const { selected } = useGenerations();
    const { fillQueue, takeReady, takeNext } = usePokemonQueue(selected);

    const revealed = result !== null;

    useEffect(() => {
        fillQueue();
    }, []);

    useEffect(() => {
        if(starterPokemon && !pokemon) {
            setPokemon(starterPokemon);
        }
    }, [starterPokemon]);

    function handleGuess(name: string) {
        if(!pokemon || revealed) return;
        if(!pokemonInfo.some(p => p.name === name)) {
            setError(`No Pokémon called "${name}" in the selected generations.`);
            return;
        }

        if(name === pokemon.name) {
            const newStreak = streak + 1;
            setStreak(newStreak);
            recordStreak(newStreak);
            setResult({ outcome: "correct", guess: name });
        }
        else {
            setStreak(0);
            setWrongFlash(n => n + 1);
            setResult({ outcome: "wrong", guess: name });
        }
    }

    function giveUp() {
        setStreak(0);
        setError('');
        setResult({ outcome: "gaveUp" });
    }

    async function nextPokemon() {
        if(!pokemon) return;
        setResult(null);
        setError('');
        // Swap straight to a preloaded Pokemon when one is ready
        const ready = takeReady(pokemon.id);
        if(ready) {
            setPokemon(ready);
        }
        else {
            setPokemon(null);
            setPokemon(await takeNext(pokemon.id));
        }
    }

    const message = !result || !pokemon ? null
        : result.outcome === "correct" ? <span className="text-good">Correct! It's <span className="capitalize">{pokemon.name}</span>!</span>
        : result.outcome === "wrong" ? <span className="text-bad">Not <span className="capitalize">{result.guess}</span>, it's <span className="capitalize">{pokemon.name}</span>!</span>
        : <span className="text-muted">It's <span className="capitalize">{pokemon.name}</span>!</span>;

    return(
        <GameLayout title="Who's That Pokémon?">
            <WrongFlash count={wrongFlash} />
            <div className="w-full max-w-md flex flex-col items-center gap-4">
                <StreakBadge streak={streak} best={best} />

                <Card className="w-full aspect-square flex items-center justify-center overflow-hidden bg-[radial-gradient(circle,var(--color-gold)_0%,var(--color-warn)_35%,var(--color-poke)_75%)]!">
                    {pokemon ? (
                        <img
                            key={pokemon.id}
                            src={pokemon.sprites.front_default}
                            alt={revealed ? pokemon.name : "Mystery Pokémon"}
                            className={`w-[85%] h-[85%] pixelated animate-pop transition-[filter] duration-500 ${revealed ? "" : "brightness-0"}`}
                            draggable={false}
                        />
                    ) : (
                        <img src={pokeBall} alt="Loading" className="w-20 h-20 animate-spin opacity-70" />
                    )}
                </Card>

                <p className="h-8 text-xl font-display font-semibold text-center">{message}</p>

                {revealed ? (
                    <Button onClick={nextPokemon} autoFocus className="w-full max-w-xs">Next Pokémon</Button>
                ) : (
                    <>
                        <div className="w-full">
                            <PokemonSearch
                                pokemonInfo={pokemonInfo}
                                onSubmit={handleGuess}
                                onType={() => setError('')}
                                placeholder="Who's that Pokémon?"
                                showSprites={false}
                                disabled={!pokemon || pokemonInfo.length === 0}
                            />
                            {error && <p className="mt-2 text-sm text-bad">{error}</p>}
                        </div>
                        <Button variant="secondary" onClick={giveUp} disabled={!pokemon}>Give up</Button>
                    </>
                )}
            </div>
        </GameLayout>
    )
}
