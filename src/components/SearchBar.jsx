import React, { useState } from 'react';
import { getPokemon } from '../services/pokeApi';
import Guesses from './Guesses';
import './SearchBar.css';

export default function SearchBar(props) {
    const [ search, setSearch ] = useState('');
    const [ allGuesses, setAllGuesses ] = useState([]);
    const [ dropdown, setDropdown ] = useState(false);
    const [ filteredInfo, setFilteredInfo ] = useState([]);

    function handleInput(event) {
        setSearch(event.target.value);
        if(event.target.value) {
            autoComplete(event.target.value);
            setDropdown(true);
        }
        else {
            setDropdown(false);
        }
    }

    async function handleSubmit(event, name) {
        if(event) event.preventDefault();
        const pokeName = name || search;
        try {
            const guessPokemon = await getPokemon(pokeName.toLowerCase());
            setAllGuesses(prev => [...prev, guessPokemon]);
            if(guessPokemon.name === props.targetPokemon.name) {
                console.log("Success");
            }
        } catch(err) {
            console.error("Invalid Pokemon:", err);
        }
        setSearch('');
        setDropdown(false);
    }

    function autoComplete(chars) {
        if(!props.pokemonInfo) {
            return;
        }
        const newChars = chars.toLowerCase();
        setFilteredInfo(props.pokemonInfo.filter(pokemon => pokemon.name.startsWith(newChars)));
        console.log(filteredInfo);
    }

    return(
        <div className="game-container">

            <div className="search-bar">
                <input 
                    type="text" 
                    value={search} 
                    onChange={handleInput}
                    onKeyDown={(e) => {
                        if(e.key === "Enter") handleSubmit(e);
                    }}
                />
                <button type="submit" onClick={handleSubmit}>Submit</button>   
            
                <div className="poke-dropdown">
                    {dropdown && filteredInfo.slice(0, 5).map(pokemon => (
                        <li className="dropdown-item" key={pokemon.id} onClick={() => handleSubmit(null, pokemon.name)}>
                            {pokemon.name}
                            <img src={pokemon.sprite} />
                        </li>
                    ))}
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
                        <Guesses guessPokemon={guessPokemon} key={index} targetPokemon={props.targetPokemon} guessPokemonPic={guessPokemon.sprites.front_default}/>
                    ))}
                </div>
            </div>
        </div>
    )
}