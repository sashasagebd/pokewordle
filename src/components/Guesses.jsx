import './Guesses.css';
import upArrow from '../assets/up-arrow.svg';
import downArrow from '../assets/down-arrow.svg'
import { useEffect } from 'react';

export default function Guesses( {guessPokemon, targetPokemon, guessPokemonPic} ) {

    const typeMatchups = {
        normal: {
            effective: [],
            notEffective: ["rock", "ghost", "steel"]
        },
        fire: {
            effective: ["grass", "ice", "bug", "steel"],
            notEffective: ["water", "rock", "dragon"]
        },
        water: {
            effective: ["fire", "ground", "rock"],
            notEffective: ["grass", "dragon"]
        },
        grass: {
            effective: ["water", "ground", "rock"],
            notEffective: ["fire", "poison", "flying", "bug", "dragon", "steel"]
        },
        electric: {
            effective: ["water", "flying"],
            notEffective: ["grass", "ground", "dragon"]
        },
        ice: {
            effective: ["grass", "ground", "flying", "dragon"],
            notEffective: ["fire", "water", "steel"]
        },
        fighting: {
            effective: ["normal", "ice", "rock", "dark", "steel"],
            notEffective: ["poison", "flying", "psychic", "bug", "ghost", "fairy"]
        },
        poison: {
            effective: ["grass", "fairy"],
            notEffective: ["ground", "rock", "ghost"]
        },
        ground: {
            effective: ["poison", "rock", "steel", "fire", "electric"],
            notEffective: ["bug", "grass", "flying"]
        },
        flying: {
            effective: ["fighting", "bug", "grass"],
            notEffective: ["rock", "steel", "electric"]
        },
        psychic: {
            effective: ["fighting", "poison"],
            notEffective: ["steel", "dark"]
        },
        bug: {
            effective: ["grass", "psychic", "dark"],
            notEffective: ["fighting", "flying", "poison", "ghost", "steel", "fire", "fairy"]
        },
        rock: {
            effective: ["flying", "bug", "fire", "ice"],
            notEffective: ["fighting", "ground", "steel"]
        },
        ghost: {
            effective: ["psychic"],
            notEffective: ["dark", "normal"]
        },
        dragon: {
            effective: [],
            notEffective: ["steel", "fairy"]
        },
        dark: {
            effective: ["ghost", "psychic"],
            notEffective: ["fighting", "fairy"]
        },
        steel: {
            effective: ["rock", "ice", "fairy"],
            notEffective: ["fire", "water", "electric"]
        },
        fairy: {
            effective: ["fighting", "dragon", "dark"],
            notEffective: ["poison", "steel", "fire"]
        }

    }
    
    function compareTwo(guess, target) {
        const intGuess = Number(guess);
        const intTarget = Number(target);
        if(intGuess === intTarget) {
            return "Same";
        }
        else if(intGuess > intTarget) {
            return downArrow;
        }
        else {
            return upArrow;
        }
    }

    function typeMatchup(guess, target) {
        if(guess === target) {
           return "Same";
        }
        else if(typeMatchups[guess].effective.includes(target)) {
           return "Effective against";
        }
        else if(typeMatchups[target].effective.includes(guess)) {
            return "Weak against";
        }
        else {
            return "Neutral"
        }
    }



    return(
        <div className="guess-row">
            <div className="poke-name">
                <p>{guessPokemon.name}</p>
            </div>
            <div className="poke-pic">
                <img src={guessPokemonPic} />
            </div>
            <div className="height">
                <img src={compareTwo(guessPokemon.height, targetPokemon.height)} />
            </div>
            <div className="weight">
                <img src={compareTwo(guessPokemon.weight, targetPokemon.weight)} />
            </div>
            <div className="type">
                {typeMatchup(guessPokemon.types[0].type.name, targetPokemon.types[0].type.name)}
            </div>
        </div>
    )
}