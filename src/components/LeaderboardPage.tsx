import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Leaderboard, Mode } from '../types'
import { getLeaderboard, errorMessage } from '../services/pokeApi'
import { GENERATIONS } from '../generations'
import { useGenerations } from '../useGenerations'
import { usePlayer } from '../usePlayer'
import GameLayout from './GameLayout'
import Card from './Card'

const modes: { mode: Mode, label: string }[] = [
    { mode: "wordle", label: "PokéWordle" },
    { mode: "higher_lower", label: "Higher or Lower" },
    { mode: "whos_that", label: "Who's That" },
];

const isMode = (s: string | null): s is Mode => modes.some(m => m.mode === s);

function scoreText(mode: Mode, best: number) {
    if(mode === "wordle") return `${best} ${best === 1 ? "guess" : "guesses"}`;
    return `${best} in a row`;
}

export default function LeaderboardPage() {
    const [ params, setParams ] = useSearchParams();
    const mode: Mode = isMode(params.get("mode")) ? params.get("mode") as Mode : "wordle";
    const { selected } = useGenerations();
    const { me } = usePlayer();
    const [ board, setBoard ] = useState<Leaderboard | null>(null);
    const [ error, setError ] = useState<string>('');

    const gensLabel = selected.length === 0 || selected.length === GENERATIONS.length
        ? "All generations"
        : selected.map(i => GENERATIONS[i].label).join(", ");

    useEffect(() => {
        let cancelled = false;
        setBoard(null);
        setError('');
        getLeaderboard(mode, selected).then(
            b => { if(!cancelled) setBoard(b); },
            err => { console.error(err); if(!cancelled) setError(errorMessage(err, "Couldn't load the leaderboard.")); },
        );
        return () => { cancelled = true; };
    }, [mode, selected]);

    const mine = board?.me;
    const shownMine = mine?.rank != null && board!.entries.some(e => e.username === me?.username);

    return (
        <GameLayout title="Leaderboard" subtitle={gensLabel}>
            <div className="w-full max-w-2xl flex flex-col items-center gap-6">
                <div className="inline-flex flex-wrap justify-center rounded-full border border-line bg-surface p-1">
                    {modes.map(m => (
                        <button
                            key={m.mode}
                            onClick={() => setParams({ mode: m.mode })}
                            className={`cursor-pointer rounded-full px-4 py-1.5 font-display font-semibold transition ${m.mode === mode ? "bg-poke text-white" : "text-muted hover:text-white"}`}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>

                <Card className="w-full p-2 sm:p-4">
                    {error && <p className="text-center text-bad py-8">{error}</p>}
                    {!error && !board && <p className="text-center text-muted py-8">Loading…</p>}
                    {board && board.entries.length === 0 && (
                        <p className="text-center text-muted py-8">No scores here yet. Be the first!</p>
                    )}
                    {board && board.entries.length > 0 && (
                        <ol className="flex flex-col">
                            {board.entries.map(e => {
                                const isMe = e.username === me?.username;
                                return (
                                    <li key={e.username} className={`grid grid-cols-[3rem_1fr_auto] items-center gap-2 rounded-xl px-3 py-2.5 ${isMe ? "bg-poke/15 border border-poke/50" : ""}`}>
                                        <span className={`font-display font-bold ${e.rank <= 3 ? "text-gold" : "text-muted"}`}>#{e.rank}</span>
                                        <span className="font-semibold truncate">{e.username}{isMe && <span className="text-muted font-normal"> (you)</span>}</span>
                                        <span className="font-display font-semibold">{scoreText(mode, e.best)}</span>
                                    </li>
                                );
                            })}
                        </ol>
                    )}
                </Card>

                {mine && mine.rank === null && (
                    <p className="text-sm text-muted text-center">
                        Your best here is <span className="text-gold font-semibold">{scoreText(mode, mine.best)}</span>. Claim a name on the home page to appear on the board.
                    </p>
                )}
                {mine && mine.rank !== null && !shownMine && (
                    <p className="text-sm text-muted text-center">
                        You're <span className="text-gold font-semibold">#{mine.rank}</span> with {scoreText(mode, mine.best)}.
                    </p>
                )}
                <p className="text-xs text-muted text-center">Each set of generations has its own board. Change yours on the home page.</p>
            </div>
        </GameLayout>
    );
}
