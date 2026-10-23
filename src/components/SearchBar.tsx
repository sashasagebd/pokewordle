import React, { useState } from 'react';
import type { SearchProps, Pokemon, PokemonInfo } from '../types';
import { getPokemon } from '../services/pokeApi';
import Guesses, { guessGrid } from './Guesses';
import GameLayout from './GameLayout';
import Card from './Card';
import Button from './Button';

export default function SearchBar({ targetPokemon, pokemonInfo, onNewGame }: SearchProps) {
    const [ search, setSearch ] = useState<string>('');
    const [ allGuesses, setAllGuesses ] = useState<Pokemon[]>([]);
    const [ dropdown, setDropdown ] = useState<boolean>(false);
    const [ filteredInfo, setFilteredInfo ] = useState<PokemonInfo[]>([]);
    const [ highlighted, setHighlighted ] = useState<number>(0);
    const [ victory, setVictory ] = useState<boolean>(false);
    const [ error, setError ] = useState<string>('');

    const suggestions = dropdown ? filteredInfo.slice(0, 6) : [];

    function handleInput(event: React.ChangeEvent<HTMLInputElement>) {
        setSearch(event.target.value);
        setError('');
        setHighlighted(0);
        if(event.target.value) {
            autoComplete(event.target.value);
            setDropdown(true);
        }
        else {
            setDropdown(false);
        }
    }

    async function handleSubmit(name?: string) {
        const pokeName = (name || search).trim().toLowerCase();
        if(!pokeName) return;
        setSearch('');
        setDropdown(false);
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

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if(e.key === "ArrowDown" && suggestions.length) {
            e.preventDefault();
            setHighlighted(i => (i + 1) % suggestions.length);
        }
        else if(e.key === "ArrowUp" && suggestions.length) {
            e.preventDefault();
            setHighlighted(i => (i - 1 + suggestions.length) % suggestions.length);
        }
        else if(e.key === "Enter") {
            e.preventDefault();
            handleSubmit(suggestions[highlighted]?.name);
        }
        else if(e.key === "Escape") {
            setDropdown(false);
        }
    }

    function autoComplete(chars: string) {
        if(!pokemonInfo) {
            return;
        }
        const newChars = chars.toLowerCase();
        setFilteredInfo(pokemonInfo.filter(pokemon => pokemon.name.startsWith(newChars)));
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
                <div className="relative">
                    <input
                        className="w-full rounded-2xl border border-line bg-surface px-5 py-4 text-lg placeholder:text-muted outline-none focus:border-poke focus:ring-4 focus:ring-poke/20 transition disabled:opacity-50"
                        type="text"
                        placeholder={victory ? "You got it!" : "Type a Pokémon name…"}
                        value={search}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        onBlur={() => setDropdown(false)}
                        disabled={victory || !targetPokemon}
                        autoFocus
                    />
                    {suggestions.length > 0 && (
                        <Card className="absolute z-10 mt-2 w-full overflow-hidden p-1 bg-surface!">
                            <ul>
                                {suggestions.map((pokemon, index) => (
                                    <li
                                        key={pokemon.name}
                                        onMouseDown={(e) => { e.preventDefault(); handleSubmit(pokemon.name); }}
                                        onMouseEnter={() => setHighlighted(index)}
                                        className={`flex items-center gap-3 rounded-xl px-2 cursor-pointer capitalize font-semibold ${index === highlighted ? "bg-surface-2" : ""}`}
                                    >
                                        <img src={pokemon.sprite} alt="" className="w-12 h-12 pixelated" />
                                        {pokemon.name}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}
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
