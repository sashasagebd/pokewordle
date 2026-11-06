import { useRef, useState } from 'react';
import type { SearchProps } from '../types';
import { ApiError, guess, spriteUrl } from '../services/pokeApi';
import { useGame } from '../useGame';
import { useBestScore } from '../useBestScore';
import Guesses, { guessGrid } from './Guesses';
import GameLayout from './GameLayout';
import Card from './Card';
import Button from './Button';
import PokemonSearch from './PokemonSearch';

export default function SearchBar({ pokemonInfo }: SearchProps) {
    const { game, setGame, newGame, loadError } = useGame("wordle");
    const { best, recordScore } = useBestScore("wordle");
    const [ error, setError ] = useState<string>('');
    // Guesses wait for the one before (not by disabling the input, which would lose focus)
    const busy = useRef<boolean>(false);

    const victory = game?.status === "won";
    // Newest first
    const guesses = [...(game?.guesses ?? [])].reverse();

    async function handleSubmit(pokeName: string) {
        if(!game || game.status !== "active" || busy.current) return;
        busy.current = true;
        try {
            const res = await guess(game.id, pokeName);
            if(res.game.status === "won") recordScore(res.game.score);
            setGame(res.game);
        } catch(err) {
            if(err instanceof ApiError && err.status === 400) {
                setError(err.message);
            } else {
                console.error(err);
                setError("Couldn't send that guess. Try again.");
            }
        } finally {
            busy.current = false;
        }
    }

    async function playAgain() {
        setError('');
        try {
            setGame(await newGame());
        } catch(err) {
            console.error(err);
            setError("Couldn't start a new game. Try again.");
        }
    }

    return(
        <GameLayout title="PokéWordle" subtitle="Find the mystery Pokémon" mode="wordle">
            <div className="w-full max-w-2xl flex flex-col gap-6">
                <div>
                    <PokemonSearch
                        pokemonInfo={pokemonInfo}
                        onSubmit={handleSubmit}
                        onType={() => setError('')}
                        placeholder={victory ? "You got it!" : undefined}
                        disabled={victory || !game}
                    />
                    {(error || loadError) && <p className="mt-2 text-sm text-bad">{error || loadError}</p>}
                </div>

                {victory && game.answer && (
                    <Card className="p-5 flex items-center gap-4 border-good/50 animate-pop">
                        <img src={spriteUrl(game.answer.id)} alt="" className="w-20 h-20 pixelated" />
                        <div className="flex-1">
                            <h2 className="text-xl font-semibold">It's <span className="capitalize text-good">{game.answer.name}</span>!</h2>
                            <p className="text-sm text-muted">
                                Solved in {game.score} {game.score === 1 ? "guess" : "guesses"}.
                                {best > 0 && <> Your best: <span className="text-gold font-semibold">{best}</span>.</>}
                            </p>
                        </div>
                        <Button onClick={playAgain}>Play again</Button>
                    </Card>
                )}

                <div className="flex flex-col gap-2">
                    <div className={`${guessGrid} text-xs uppercase tracking-wider text-muted font-semibold text-center`}>
                        <div className="text-left pl-2">Pokémon</div>
                        <div>Height</div>
                        <div>Weight</div>
                        <div>Type</div>
                    </div>
                    {guesses.map(comparison => (
                        <Guesses comparison={comparison} key={comparison.guess.id} />
                    ))}
                    {guesses.length === 0 && (
                        <p className="text-center text-muted text-sm py-8 rounded-2xl border border-dashed border-line">
                            Your guesses will show up here. Arrows point toward the answer.
                        </p>
                    )}
                </div>
            </div>
        </GameLayout>
    )
}
