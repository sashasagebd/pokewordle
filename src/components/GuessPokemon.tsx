import { useState, useEffect, useRef } from 'react'
import type { Game, GuessPokemonProps, Pokemon } from '../types'
import { ApiError, answer, giveUp, spriteUrl } from '../services/pokeApi'
import GameLayout from './GameLayout'
import Card from './Card'
import Button from './Button'
import PokemonSearch from './PokemonSearch'
import StreakBadge from './StreakBadge'
import WrongFlash from './WrongFlash'
import pokeBall from '../assets/pokeball.svg'
import { useGame } from '../useGame'
import { useSilhouettes } from '../useSilhouettes'
import { useBestScore } from '../useBestScore'

// null while guessing; set once the server has revealed the Pokémon
type Result = { outcome: "correct" | "wrong" | "gaveUp", guess?: string, answer: Pokemon, streak: number } | null;

export default function GuessPokemon({ pokemonInfo }: GuessPokemonProps) {
    const { game, setGame, newGame, loadError } = useGame("whos_that");
    const silhouettes = useSilhouettes();
    // The silhouette and the round it's for, so a new round never shows the last one's
    const [ image, setImage ] = useState<{ key: string, url: string } | null>(null);
    const [ result, setResult ] = useState<Result>(null);
    const { best, recordScore } = useBestScore("whos_that");
    const [ error, setError ] = useState<string>('');
    const [ wrongFlash, setWrongFlash ] = useState<number>(0);
    // What "Next Pokémon" shows: this game's next round, or a new game after a loss
    const pending = useRef<Promise<Game> | null>(null);
    const busy = useRef<boolean>(false);

    const revealed = result !== null;
    const round = game?.status === "active" ? game.round : undefined;
    const streak = result ? result.streak : round ? game!.score : 0;

    // Show this round's silhouette and fetch the next round's
    const roundKey = game && round ? `${game.id}/${round.n}` : null;
    useEffect(() => {
        if(!game || !round) return;
        let cancelled = false;
        const key = roundKey!;
        const ready = silhouettes.peek(game.id, round.n);
        if(ready) setImage({ key, url: ready });
        silhouettes.get(game.id, round.n).then(
            url => { if(!cancelled) setImage({ key, url }); },
            err => { console.error(err); if(!cancelled) setError("Couldn't load the silhouette."); },
        );
        silhouettes.get(game.id, round.n + 1).catch(() => {});
        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roundKey]);

    // A lost game is over on the server: get the next one ready, silhouette and all
    function prepareNewGame() {
        pending.current = newGame().then(g => {
            silhouettes.get(g.id, 1).catch(() => {});
            return g;
        });
        pending.current.catch(() => {}); // handled in nextPokemon
    }

    async function handleGuess(name: string) {
        if(!game || !round || revealed || busy.current) return;
        if(!pokemonInfo.some(p => p.name === name)) {
            setError(`No Pokémon called "${name}" in the selected generations.`);
            return;
        }
        busy.current = true;
        try {
            const res = await answer(game.id, { n: round.n, name });
            if(res.correct) {
                recordScore(res.game.score);
                pending.current = Promise.resolve(res.game);
            } else {
                setWrongFlash(n => n + 1);
                prepareNewGame();
            }
            setResult({ outcome: res.correct ? "correct" : "wrong", guess: name, answer: res.answer, streak: res.correct ? res.game.score : 0 });
        } catch(err) {
            if(err instanceof ApiError && err.status === 400) {
                setError(err.message);
            } else if(err instanceof ApiError && err.status === 409 && err.game) {
                setGame(err.game); // that round was already answered: catch up
            } else {
                console.error(err);
                setError("Couldn't reach the game server. Try again.");
            }
        } finally {
            busy.current = false;
        }
    }

    async function handleGiveUp() {
        if(!game || !round || revealed || busy.current) return;
        busy.current = true;
        setError('');
        try {
            const over = await giveUp(game.id);
            prepareNewGame();
            if(over.answer) setResult({ outcome: "gaveUp", answer: over.answer, streak: 0 });
        } catch(err) {
            console.error(err);
            setError("Couldn't reach the game server. Try again.");
        } finally {
            busy.current = false;
        }
    }

    async function nextPokemon() {
        try {
            const next = await (pending.current ?? newGame());
            pending.current = null;
            setGame(next);
            setResult(null);
            setError('');
        } catch(err) {
            console.error(err);
            pending.current = null; // the next click tries afresh
            setError("Couldn't start a new game. Try again.");
        }
    }

    const message = !result ? null
        : result.outcome === "correct" ? <span className="text-good">Correct! It's <span className="capitalize">{result.answer.name}</span>!</span>
        : result.outcome === "wrong" ? <span className="text-bad">Not <span className="capitalize">{result.guess}</span>, it's <span className="capitalize">{result.answer.name}</span>!</span>
        : <span className="text-muted">It's <span className="capitalize">{result.answer.name}</span>!</span>;

    const silhouette = image && image.key === roundKey ? image.url : null;
    const shown = result ? spriteUrl(result.answer.id) : silhouette;

    return(
        <GameLayout title="Who's That Pokémon?" mode="whos_that">
            <WrongFlash count={wrongFlash} />
            <div className="w-full max-w-md flex flex-col items-center gap-4">
                <StreakBadge streak={streak} best={best} />

                <Card className="w-full aspect-square flex items-center justify-center overflow-hidden bg-[radial-gradient(circle,var(--color-gold)_0%,var(--color-warn)_35%,var(--color-poke)_75%)]!">
                    {shown ? (
                        <img
                            key={shown}
                            src={shown}
                            alt={result ? result.answer.name : "Mystery Pokémon"}
                            className="w-[85%] h-[85%] pixelated animate-pop"
                            draggable={false}
                        />
                    ) : (
                        <img src={pokeBall} alt="Loading" className="w-20 h-20 animate-spin opacity-70" />
                    )}
                </Card>

                <p className="h-8 text-xl font-display font-semibold text-center">{message}</p>

                {revealed ? (
                    <>
                        <Button onClick={nextPokemon} autoFocus className="w-full max-w-xs">Next Pokémon</Button>
                        {error && <p className="text-sm text-bad">{error}</p>}
                    </>
                ) : (
                    <>
                        <div className="w-full">
                            <PokemonSearch
                                pokemonInfo={pokemonInfo}
                                onSubmit={handleGuess}
                                onType={() => setError('')}
                                placeholder="Who's that Pokémon?"
                                showSprites={false}
                                disabled={!silhouette || pokemonInfo.length === 0}
                            />
                            {(error || loadError) && <p className="mt-2 text-sm text-bad">{error || loadError}</p>}
                        </div>
                        <Button variant="secondary" onClick={handleGiveUp} disabled={!round}>Give up</Button>
                    </>
                )}
            </div>
        </GameLayout>
    )
}
