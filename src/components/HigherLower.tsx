import type { HLProps, Pokemon } from '../types'
import { useState, useEffect, type ReactNode } from 'react'
import GameLayout from './GameLayout'
import Card from './Card'
import StreakBadge from './StreakBadge'
import WrongFlash from './WrongFlash'
import { ArrowUp, ArrowDown } from './Icons'
import pokeBall from '../assets/pokeball.svg'
import { useGenerations } from '../useGenerations'
import { usePokemonQueue } from '../usePokemonQueue'
import { useBestScore } from '../useBestScore'

type Category = "height" | "weight";

const categories: { key: Category, label: string, unit: string }[] = [
    { key: "height", label: "Height", unit: "m" },
    { key: "weight", label: "Weight", unit: "kg" },
]

function PokemonCard({ pokemon, value, hidden, children }: { pokemon: Pokemon | null, value: string, hidden?: boolean, children?: ReactNode }) {
    return (
        <Card className="flex-1 w-full p-4 sm:p-6 flex flex-col items-center text-center">
            <div className="w-28 h-28 sm:w-52 sm:h-52 rounded-full bg-surface-2 flex items-center justify-center">
                {pokemon ? (
                    <img key={pokemon.id} src={pokemon.sprites.front_default} alt={pokemon.name} className="w-full h-full pixelated animate-pop" draggable={false} />
                ) : (
                    <img src={pokeBall} alt="Loading" className="w-16 h-16 animate-spin opacity-60" />
                )}
            </div>
            <h2 className="mt-2 sm:mt-4 text-xl sm:text-2xl font-semibold capitalize">{pokemon?.name ?? "…"}</h2>
            <p className={`mt-1 font-display text-3xl font-bold ${hidden ? "text-muted" : "text-gold"}`}>{value}</p>
            {children}
        </Card>
    )
}

export default function HigherLower({ starterPokemon } : HLProps) {
    const [ currentPokemon, setCurrentPokemon ] = useState<Pokemon | null>(starterPokemon);
    const [ nextPokemon, setNextPokemon ] = useState<Pokemon | null>(null);
    const [ category, setCategory ] = useState<number>(0);
    const [ correctCounter, setCorrectCounter ] = useState<number>(0);
    const { best, recordStreak } = useBestScore("higherlower");
    const [ result, setResult ] = useState<{ correct: boolean, text: string } | null>(null);
    // Bumped on each wrong guess so the flash overlay remounts and replays
    const [ wrongFlash, setWrongFlash ] = useState<number>(0);
    const { selected } = useGenerations();
    const { takeReady, takeNext } = usePokemonQueue(selected);

    useEffect(() => {
        takeNext(starterPokemon?.id).then(p => setNextPokemon(prev => prev ?? p));
    }, []);

    useEffect(() => {
        if(starterPokemon && !currentPokemon) {
            setCurrentPokemon(starterPokemon);
        }
    }, [starterPokemon]);

    const { key, unit } = categories[category];
    const format = (p: Pokemon | null) => p ? `${p[key] / 10} ${unit}` : "";

    async function handleGuess(higher: boolean) {
        if(!currentPokemon || !nextPokemon) return;

        const correct = higher
            ? nextPokemon[key] >= currentPokemon[key]
            : nextPokemon[key] <= currentPokemon[key];

        if(correct) {
            const streak = correctCounter + 1;
            setCorrectCounter(streak);
            recordStreak(streak);
        }
        else {
            setCorrectCounter(0);
            setWrongFlash(n => n + 1);
        }
        setResult({ correct, text: `${nextPokemon.name} is ${format(nextPokemon)}` });

        // Advance straight away with a preloaded Pokemon instead of waiting on a fetch
        setCurrentPokemon(nextPokemon);
        const upcoming = takeReady(nextPokemon.id);
        if(upcoming) {
            setNextPokemon(upcoming);
        }
        else {
            setNextPokemon(null);
            setNextPokemon(await takeNext(nextPokemon.id));
        }
    }

    return(
        <GameLayout title="Higher or Lower">
            <WrongFlash count={wrongFlash} />
            <div className="w-full max-w-4xl flex flex-col items-center gap-4 sm:gap-6">
                <div className="inline-flex rounded-full border border-line bg-surface p-1">
                    {categories.map((c, index) => (
                        <button
                            key={c.key}
                            onClick={() => setCategory(index)}
                            className={`cursor-pointer rounded-full px-5 py-1.5 font-display font-semibold transition ${index === category ? "bg-poke text-white" : "text-muted hover:text-white"}`}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>

                <StreakBadge streak={correctCounter} best={best} />

                <p className={`h-6 text-sm font-semibold capitalize ${result?.correct ? "text-good" : "text-bad"}`}>
                    {result && `${result.correct ? "Correct!" : "Nope!"} ${result.text}`}
                </p>

                <div className="w-full flex flex-col md:flex-row items-stretch gap-4">
                    <PokemonCard pokemon={currentPokemon} value={format(currentPokemon)} />

                    <div className="self-center shrink-0 -my-6 md:my-0 z-10 w-12 h-12 rounded-full bg-gold text-ink font-display font-bold flex items-center justify-center shadow-lg">
                        VS
                    </div>

                    <PokemonCard pokemon={nextPokemon} value="?" hidden>
                        <p className="text-sm text-muted mt-1">
                            {categories[category].label.toLowerCase()} compared to <span className="capitalize">{currentPokemon?.name ?? "…"}</span>
                        </p>
                        <div className="mt-4 grid grid-cols-2 gap-3 w-full max-w-xs">
                            <button
                                onClick={() => handleGuess(true)}
                                disabled={!nextPokemon || !currentPokemon}
                                className="cursor-pointer flex items-center justify-center gap-2 rounded-xl bg-good/15 border border-good/50 text-good hover:bg-good/25 py-3 font-display font-semibold transition active:scale-95 disabled:opacity-50"
                            >
                                <ArrowUp className="w-5 h-5" /> Higher
                            </button>
                            <button
                                onClick={() => handleGuess(false)}
                                disabled={!nextPokemon || !currentPokemon}
                                className="cursor-pointer flex items-center justify-center gap-2 rounded-xl bg-bad/15 border border-bad/50 text-bad hover:bg-bad/25 py-3 font-display font-semibold transition active:scale-95 disabled:opacity-50"
                            >
                                <ArrowDown className="w-5 h-5" /> Lower
                            </button>
                        </div>
                    </PokemonCard>
                </div>
            </div>
        </GameLayout>
    )
}
