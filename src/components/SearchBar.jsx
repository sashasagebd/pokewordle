import React, { useState } from 'react';
import { getPokemon } from '../services/pokeApi';
import Guesses from './Guesses';
import './SearchBar.css';

export default function SearchBar(props) {
    const [ search, setSearch ] = useState('');
    const [ allGuesses, setAllGuesses ] = useState([]);
    const [ dropdown, setDropdown ] = useState(false);
    const [ filteredNames, setFilteredNames ] = useState([]);

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

    async function handleSubmit(event) {
        event.preventDefault();
        if(!search) return;
        try {
            const guessPokemon = await getPokemon(search.toLowerCase());
            setAllGuesses(prev => [...prev, guessPokemon]);
            if(guessPokemon.name === props.targetPokemon.name) {
                console.log("Success");
            }
        } catch(err) {
            console.error("Invalid Pokemon:", err);
        }
    }

    function autoComplete(chars) {
        if(!props.pokemonNames) {
            return;
        }
        const newChars = chars.toLowerCase();
        setFilteredNames(props.pokemonNames.filter(name => name.startsWith(newChars)));
        console.log(filteredNames);
    }


    return(
        <div className="game-container">
            <div className="search-bar">
                <input type="text" value={search} onChange={handleInput}/>
                <button type="submit" onClick={handleSubmit}>Submit</button>   
            </div>
            <div className="dropdown">
                {dropdown && filteredNames.map(name => (
                    <li key={name.id}>{name}</li>
                ))}
            </div>
            <div className="guesses-label">
                <p>Name</p>
                <p>Pic</p>
                <p>Height</p>
                <p>Weight</p>
            </div>
            <div className="guesses-list">
                {allGuesses.map((guessPokemon, index) => (
                    <Guesses guessPokemon={guessPokemon} key={index} targetPokemon={props.targetPokemon} guessPokemonPic={guessPokemon.sprites.front_default}/>
                ))}
            </div>
        </div>
    )
}