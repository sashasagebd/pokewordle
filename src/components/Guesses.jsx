import './Guesses.css';
import { useEffect } from 'react';

export default function Guesses( {guessPokemon, targetPokemon, guessPokemonPic} ) {


    const typeMatchups = {
        fire: {
            weak: "water",
            strong: "grass"
        },
        water: {
            weak: "grass",
            strong: "fire"
        },
        grass: {
            weak: "fire",
            strong: "water"
        },
        rock: {

        },
        bug: {

        }
    }
    
    function compareTwo(guess, target) {
        const intGuess = Number(guess);
        const intTarget = Number(target);
        if(intGuess === intTarget) {
            return "Same";
        }
        else if(intGuess > intTarget) {
            return "Lower"
        }
        else {
            return "Higher"
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
                {compareTwo(guessPokemon.height, targetPokemon.height)}
            </div>
            <div className="weight">
                {compareTwo(guessPokemon.weight, targetPokemon.weight)}
            </div>
            <div className="type">

            </div>
        </div>
    )
}