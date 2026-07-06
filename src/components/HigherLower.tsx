import type { HLProps, Pokemon } from '../types'
import { Link } from 'react-router-dom'
import { getRandomPokemon } from '../services/pokeApi'
import Card from './Card'
import { useState, useEffect } from 'react'
import upArrow from '../assets/up-arrow.svg';
import downArrow from '../assets/down-arrow.svg';
import pokeBall from '../assets/pokeball.svg'

export default function HigherLower({ starterPokemon } : HLProps) {
    const [ currentPokemon, setCurrentPokemon ] = useState<Pokemon | null>(starterPokemon);
    const [ nextPokemon, setNextPokemon ] = useState<Pokemon | null>(null);
    const [ category, setCategory ] = useState<number>(0);
    const [ dropdown, setDropdown ] = useState<boolean>(false);
    const [ correctCounter, setCorrectCounter ] = useState<number>(0);

    const categories: string[] = [
        "height",
        "weight",
        
    ]

    useEffect(() => {
        async function getUniqueRandom() {
            let newPokemon: Pokemon;
            do {
                newPokemon = await getRandomPokemon();
            } 
            while(newPokemon.id === currentPokemon?.id);
            
            setNextPokemon(newPokemon);
        }
        getUniqueRandom();
    }, [currentPokemon]);

    useEffect(() => {
        if(starterPokemon && !currentPokemon) {
            setCurrentPokemon(starterPokemon);
        }
    }, [starterPokemon]);

    function handleGuess(guess: Boolean) {
        if(currentPokemon && nextPokemon) {
            if(nextPokemon.height >= currentPokemon.height && guess) { //if new is bigger
                setCurrentPokemon(nextPokemon);
                setCorrectCounter(correctCounter + 1);
            }
            else if(nextPokemon.height <= currentPokemon.height && !guess) {
                setCurrentPokemon(nextPokemon);
                setCorrectCounter(correctCounter + 1);
            }
            else {
                setCorrectCounter(0);
            
            }
        }
    }

    return(
        <div className="w-screen h-screen">
            <Link to="/" className="w-10 h-10 bg-white hover:bg-gray-100 cursor-pointer text-black rounded-full absolute top-5 left-5 flex items-center justify-center">X</Link>
            <div className="fixed top-1/4 left-1/2 -translate-x-1/2">
                <div className="relative">
                    <img src={pokeBall} className="w-30 h-30"/>
                        <span className="absolute inset-0 flex items-center justify-center text-black font-bold">
                            {correctCounter}
                        </span>
                </div>
            </div>
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                    <div
                        className="rounded-full border bg-red-600 hover:bg-red-700 w-32 h-16 flex justify-center items-center cursor-pointer"
                        onClick={() => setDropdown(!dropdown)}
                    >
                        <h3 className="first-letter:uppercase">{categories[category]}</h3>
                    </div>

                    {dropdown && (
                        <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 w-32">
                            <ul>
                                {categories.map((category, index) => (
                                    <li
                                        key={category}
                                        className="first-letter:uppercase rounded-full border bg-red-600 p-2 hover:bg-red-700 cursor-pointer text-center mb-1"
                                        onClick={() => {
                                            setCategory(index);
                                            setDropdown(false);
                                        }}
                                    >
                                        {category}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-2 h-screen">
                <Card sprite={currentPokemon?.sprites.front_default}><></></Card>
                <Card sprite={nextPokemon?.sprites.front_default}>
                    <div className="flex absolute transform translate-y-40">
                        <img src={upArrow} className="w-30 cursor-pointer" onClick={() => handleGuess(true)}/>
                        <img src={downArrow} className="w-30 cursor-pointer" onClick={() => handleGuess(false)}/>
                    </div>
                </Card>
            </div>
        </div>
    )
}