import React, { useState } from 'react';
import type { SearchProps, Pokemon, PokemonInfo } from '../types';
import { getPokemon } from '../services/pokeApi';
import Guesses from './Guesses';
import './SearchBar.css';
import { Link } from 'react-router-dom'

export default function SearchBar({ targetPokemon, pokemonInfo }: SearchProps) {
    const [ search, setSearch ] = useState<string>('');
    const [ allGuesses, setAllGuesses ] = useState<Pokemon[]>([]);
    const [ dropdown, setDropdown ] = useState<boolean>(false);
    const [ filteredInfo, setFilteredInfo ] = useState<PokemonInfo[]>([]);
    const [ victory, setVictory ] = useState<boolean>(false);

    function handleInput(event: React.ChangeEvent<HTMLInputElement>) {
        setSearch(event.target.value);
        if(event.target.value) {
            autoComplete(event.target.value);
            setDropdown(true);
        }
        else {
            setDropdown(false);
        }
    }

    async function handleSubmit(event?: React.SyntheticEvent, name?: string) {
        if(event) event.preventDefault();
        const pokeName = name || search;
        try {
            const guessPokemon = await getPokemon(pokeName.toLowerCase());
            setAllGuesses(prev => [...prev, guessPokemon]);
            if(guessPokemon.name === targetPokemon?.name) {
                console.log("Success");
                setVictory(true);
            }
        } catch(err) {
            console.error("Invalid Pokemon:", err);
        }
        setSearch('');
        setDropdown(false);
    }

    function autoComplete(chars: string) {
        if(!pokemonInfo) {
            return;
        }
        const newChars = chars.toLowerCase();
        setFilteredInfo(pokemonInfo.filter(pokemon => pokemon.name.startsWith(newChars)));
        console.log(filteredInfo);
    }

    return(
        <div className="game-container">
            <Link to="/" className="w-10 h-10 bg-white hover:bg-gray-100 cursor-pointer text-black rounded-full absolute top-5 left-5 flex items-center justify-center">X</Link>
            <div className="m-[1rem] relative">
                <input 
                    className="border rounded-sm p-1 w-full"
                    type="text" 
                    value={search} 
                    onChange={handleInput}
                    onKeyDown={(e) => {
                        if(e.key === "Enter") handleSubmit(e);
                    }}
                />
                <div className="absolute w-full bg-gray-400 flex justify-center">
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }} >
                        {dropdown && filteredInfo.slice(0, 5).map(pokemon => (
                            <li className="dropdown-item" key={pokemon.name} onClick={() => handleSubmit(undefined, pokemon.name)}>
                                {pokemon.name}
                                <img src={pokemon.sprite} />
                            </li>
                        ))}
                    </ul>
                </div>  
            </div>
            <div className="guesses">
                <div className="guesses-label">
                    <div>Name</div>
                    <div>Pic</div>
                    <div>Height</div>
                    <div>Weight</div>
                    <div>Type Matchup</div>
                </div>
                <div className="guesses-list">
                    {allGuesses.map((guessPokemon, index) => (
                        targetPokemon && <Guesses guessPokemon={guessPokemon} key={index} targetPokemon={targetPokemon} guessPokemonPic={guessPokemon.sprites.front_default}/>
                    ))}
                </div>
                {victory && (
                    <h3>Correct! Please reload to play again</h3>
                )}
            </div>
        </div>
    )
}