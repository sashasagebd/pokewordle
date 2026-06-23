import type { HLProps, Pokemon } from '../types'
import { Link } from 'react-router-dom'
import { getRandomPokemon } from '../services/pokeApi'
import Card from './Card'
import { useState, useEffect } from 'react'
import upArrow from '../assets/up-arrow.svg';
import downArrow from '../assets/down-arrow.svg';

export default function HigherLower({ starterPokemon } : HLProps) {
    const [ currentPokemon, setCurrentPokemon ] = useState<Pokemon | null>(starterPokemon);
    const [ nextPokemon, setNextPokemon ] = useState<Pokemon | null>(null);
    const [ category, setCategory ] = useState<number>(0);
    const [ dropdown, setDropdown ] = useState<boolean>(false);

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
            }
            else if(nextPokemon.height <= currentPokemon.height && !guess) {
                setCurrentPokemon(nextPokemon);
            }
            else {
                
            }
        }
    }

    return(
        <div className="w-screen h-screen">
            <Link to="/" className="w-10 h-10 bg-white hover:bg-gray-100 cursor-pointer text-black rounded-full absolute top-5 left-5 flex items-center justify-center">X</Link>
            <div 
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-red-600 w-[8%] h-[10%] flex justify-center items-center cursor-pointer"
                onClick={() => {setDropdown(!dropdown)}}
            >
                <h3 className="first-letter:uppercase">{categories[category]}</h3>
            </div>
                <div className="absolute w-full bg-gray-400 flex justify-center">
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }} >
                        {dropdown && categories.map(category => (
                            <li className="" >
                                {category}
                            </li>
                        ))}
                    </ul>
                </div>  
            <div className="grid grid-cols-2 h-screen">
                <Card sprite={currentPokemon?.sprites.front_default}>{currentPokemon?.id}</Card>
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