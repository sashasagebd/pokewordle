import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import type { Pokemon } from '../types'
import { getRandomPokemon } from '../services/pokeApi'

export default function GuessPokemon() {
    const [ pokemon, setPokemon ] = useState<Pokemon | null>(null);



    useEffect(() => {
        async function getPokemon() {
            let newPokemon: Pokemon;
            newPokemon = await getRandomPokemon();
            setPokemon(newPokemon);
        }
        getPokemon();
    }, []);
    

    return(
        <div className="w-screen h-screen">
            <Link to="/" className="w-10 h-10 bg-white hover:bg-gray-100 cursor-pointer text-black rounded-full absolute top-5 left-5 flex items-center justify-center">X</Link>
            <h3 className="absolute left-1/2 -translate-x-1/2 top-1/8">Who's That Pokemon?</h3>
            <div className="h-full flex justify-center items-center">
                <img src={pokemon?.sprites.front_default} className="h-100 w-100 brightness-0" draggable={false}/>
            </div>
        </div>
        
    )
}