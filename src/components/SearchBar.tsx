import { useState } from 'react';
import type { SearchProps, Pokemon } from '../types';
import { getPokemon } from '../services/pokeApi';
import Guesses, { guessGrid } from './Guesses';
import GameLayout from './GameLayout';
import Card from './Card';
import Button from './Button';
import PokemonSearch from './PokemonSearch';

export default function SearchBar({ targetPokemon, pokemonInfo, onNewGame }: SearchProps) {
    const [ allGuesses, setAllGuesses ] = useState<Pokemon[]>([]);
    const [ victory, setVictory ] = useState<boolean>(false);
    const [ error, setError ] = useState<string>('');

    async function handleSubmit(pokeName: string) {
        if(allGuesses.some(p => p.name === pokeName)) {
            setError(`You already guessed ${pokeName}.`);
            return;
        }
        try {
            const guessPokemon = await getPokemon(pokeName);
            setAllGuesses(prev => [guessPokemon, ...prev]);
            if(guessPokemon.name === targetPokemon?.name) {
                setVictory(true);
            }
        } catch(err) {
            console.error("Invalid Pokemon:", err);
            setError(`No Pokémon called "${pokeName}".`);
        }
    }

    function playAgain() {
        setAllGuesses([]);
        setVictory(false);
        setError('');
        onNewGame();
    }

    return(
        <GameLayout title="PokéWordle" subtitle="Find the mystery Pokémon">
            <div className="w-full max-w-2xl flex flex-col gap-6">
                <div>
                    <PokemonSearch
                        pokemonInfo={pokemonInfo}
                        onSubmit={handleSubmit}
                        onType={() => setError('')}
                        placeholder={victory ? "You got it!" : undefined}
                        disabled={victory || !targetPokemon}
                    />
                    {error && <p className="mt-2 text-sm text-bad">{error}</p>}
                </div>

                {victory && targetPokemon && (
                    <Card className="p-5 flex items-center gap-4 border-good/50 animate-pop">
                        <img src={targetPokemon.sprites.front_default} alt="" className="w-20 h-20 pixelated" />
                        <div className="flex-1">
                            <h2 className="text-xl font-semibold">It's <span className="capitalize text-good">{targetPokemon.name}</span>!</h2>
                            <p className="text-sm text-muted">Solved in {allGuesses.length} {allGuesses.length === 1 ? "guess" : "guesses"}.</p>
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
                    {allGuesses.map((guessPokemon) => (
                        targetPokemon && <Guesses guessPokemon={guessPokemon} key={guessPokemon.id} targetPokemon={targetPokemon} />
                    ))}
                    {allGuesses.length === 0 && (
                        <p className="text-center text-muted text-sm py-8 rounded-2xl border border-dashed border-line">
                            Your guesses will show up here. Arrows point toward the answer.
                        </p>
                    )}
                </div>
            </div>
        </GameLayout>
    )
}
