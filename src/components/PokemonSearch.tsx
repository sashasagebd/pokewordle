import React, { useState } from 'react';
import type { PokemonInfo, PokemonSearchProps } from '../types';
import Card from './Card';

// Name input with an autocomplete dropdown, shared by the guessing game modes
export default function PokemonSearch({ pokemonInfo, onSubmit, onType, placeholder = "Type a Pokémon name…", disabled, showSprites = true }: PokemonSearchProps) {
    const [ search, setSearch ] = useState<string>('');
    const [ dropdown, setDropdown ] = useState<boolean>(false);
    const [ filteredInfo, setFilteredInfo ] = useState<PokemonInfo[]>([]);
    const [ highlighted, setHighlighted ] = useState<number>(0);

    const suggestions = dropdown ? filteredInfo.slice(0, 6) : [];

    function handleInput(event: React.ChangeEvent<HTMLInputElement>) {
        setSearch(event.target.value);
        onType?.();
        setHighlighted(0);
        if(event.target.value) {
            autoComplete(event.target.value);
            setDropdown(true);
        }
        else {
            setDropdown(false);
        }
    }

    function handleSubmit(name?: string) {
        const pokeName = (name || search).trim().toLowerCase();
        if(!pokeName) return;
        setSearch('');
        setDropdown(false);
        onSubmit(pokeName);
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

    return(
        <div className="relative w-full">
            <input
                className="w-full rounded-2xl border border-line bg-surface px-5 py-4 text-lg placeholder:text-muted outline-none focus:border-poke focus:ring-4 focus:ring-poke/20 transition disabled:opacity-50"
                type="text"
                placeholder={placeholder}
                value={search}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                onBlur={() => setDropdown(false)}
                disabled={disabled}
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
                                className={`flex items-center gap-3 rounded-xl cursor-pointer capitalize font-semibold ${showSprites ? "px-2" : "px-4 py-3"} ${index === highlighted ? "bg-surface-2" : ""}`}
                            >
                                {showSprites && <img src={pokemon.sprite} alt="" className="w-12 h-12 pixelated" />}
                                {pokemon.name}
                            </li>
                        ))}
                    </ul>
                </Card>
            )}
        </div>
    )
}
