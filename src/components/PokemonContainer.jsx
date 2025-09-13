import { useState, useEffect } from 'react';
import { getPokemonList, getPokemon } from "../services/pokeApi";

export default function PokemonContainer() {
    const [loading, setLoading] = useState(true);
    const [pokemon, setPokemon] = useState([])
    const [onepokemon, setOnePokemon] = useState([]);

    useEffect(() => {
        async function getData() {
            try {
                const pokeData = await getPokemonList();
                setPokemon(pokeData.results)
            } catch(err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        getData();
    }, [])
    
    async function getOnePokemon(name) {
        try {
            const  onePokeData = await getPokemon(name);
            setOnePokemon(onePokeData);
        } catch(err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }


    console.log(pokemon);
    console.log(onepokemon)

    return(
        <div>A</div>
    )
}