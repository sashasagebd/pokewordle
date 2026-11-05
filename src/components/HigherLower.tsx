import type { Named, Pokemon } from '../types'
import { useState, useEffect, useRef, type ReactNode } from 'react'
import { ApiError, answer, spriteUrl } from '../services/pokeApi'
import GameLayout from './GameLayout'
import Card from './Card'
import Button from './Button'
import StreakBadge from './StreakBadge'
import WrongFlash from './WrongFlash'
import { ArrowUp, ArrowDown } from './Icons'
import pokeBall from '../assets/pokeball.svg'
import { useGame } from '../useGame'
import { useBestScore } from '../useBestScore'

type Category = "height" | "weight";

const categories: { key: Category, label: string, unit: string }[] = [
    { key: "height", label: "Height", unit: "m" },
    { key: "weight", label: "Weight", unit: "kg" },
]

function PokemonCard({ pokemon, value, hidden, children }: { pokemon: Named | null, value: string, hidden?: boolean, children?: ReactNode }) {
    return (
        <Card className="flex-1 w-full p-4 sm:p-6 flex flex-col items-center text-center">
            <div className="w-28 h-28 sm:w-52 sm:h-52 rounded-full bg-surface-2 flex items-center justify-center">
                {pokemon ? (
                    <img key={pokemon.id} src={spriteUrl(pokemon.id)} alt={pokemon.name} className="w-full h-full pixelated animate-pop" draggable={false} />
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

// Starts downloading a sprite so it shows at once when its turn comes
function preload(id: number) {
    new Image().src = spriteUrl(id);
}

export default function HigherLower() {
    const { game, setGame, newGame, loadError } = useGame("higher_lower");
    const [ category, setCategory ] = useState<number>(0);
    const { best, recordStreak } = useBestScore("higherlower");
    const [ result, setResult ] = useState<{ correct: boolean, text: string } | null>(null);
    // Bumped on each wrong guess so the flash overlay remounts and replays
    const [ wrongFlash, setWrongFlash ] = useState<number>(0);
    // One answer at a time (a ref, so the buttons don't flicker disabled on every answer)
    const busy = useRef<boolean>(false);
    const [ error, setError ] = useState<string>('');

    const round = game?.status === "active" ? game.round : undefined;
    const current = round?.current ?? null;
    const next = round?.next ?? null;
    const streak = game?.status === "active" ? game.score : 0;

    const upcomingId = round?.upcoming?.id;
    useEffect(() => {
        if(upcomingId) preload(upcomingId);
    }, [upcomingId]);

    const { key, unit } = categories[category];
    const format = (p: Pokemon | null) => p ? `${p[key] / 10} ${unit}` : "";

    // A lost game is over on the server; play on with a new one
    async function restart() {
        try {
            setGame(await newGame());
            setError('');
        } catch(err) {
            console.error(err);
            setError("Couldn't start a new game.");
        }
    }

    async function handleGuess(higher: boolean) {
        if(!game || !round || busy.current) return;
        busy.current = true;
        try {
            const res = await answer(game.id, { n: round.n, dir: higher ? "higher" : "lower", stat: key });
            setResult({ correct: res.correct, text: `${res.answer.name} is ${format(res.answer)}` });
            if(res.correct) {
                recordStreak(res.game.score);
                setGame(res.game);
            } else {
                setWrongFlash(n => n + 1);
                await restart();
            }
        } catch(err) {
            if(err instanceof ApiError && err.status === 409 && err.game) {
                setGame(err.game); // that round was already answered: catch up
            } else {
                console.error(err);
                setError("Couldn't reach the game server. Try again.");
            }
        } finally {
            busy.current = false;
        }
    }

    const message = error || loadError;

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

                <StreakBadge streak={streak} best={best} />

                {message ? (
                    <div className="flex items-center gap-3">
                        <p className="text-sm font-semibold text-bad">{message}</p>
                        {game && game.status !== "active" && <Button variant="secondary" onClick={restart}>New game</Button>}
                    </div>
                ) : (
                    <p className={`h-6 text-sm font-semibold capitalize ${result?.correct ? "text-good" : "text-bad"}`}>
                        {result && `${result.correct ? "Correct!" : "Nope!"} ${result.text}`}
                    </p>
                )}

                <div className="w-full flex flex-col md:flex-row items-stretch gap-4">
                    <PokemonCard pokemon={current} value={format(current)} />

                    <div className="self-center shrink-0 -my-6 md:my-0 z-10 w-12 h-12 rounded-full bg-gold text-ink font-display font-bold flex items-center justify-center shadow-lg">
                        VS
                    </div>

                    <PokemonCard pokemon={next} value="?" hidden>
                        <p className="text-sm text-muted mt-1">
                            {categories[category].label.toLowerCase()} compared to <span className="capitalize">{current?.name ?? "…"}</span>
                        </p>
                        <div className="mt-4 grid grid-cols-2 gap-3 w-full max-w-xs">
                            <button
                                onClick={() => handleGuess(true)}
                                disabled={!round}
                                className="cursor-pointer flex items-center justify-center gap-2 rounded-xl bg-good/15 border border-good/50 text-good hover:bg-good/25 py-3 font-display font-semibold transition active:scale-95 disabled:opacity-50"
                            >
                                <ArrowUp className="w-5 h-5" /> Higher
                            </button>
                            <button
                                onClick={() => handleGuess(false)}
                                disabled={!round}
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
