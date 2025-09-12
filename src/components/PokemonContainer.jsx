import { useState, useEffect } from 'react';
import { getPokemonList, getPokemon } from "../services/pokeApi";

export default function PokemonContainer() {
    const [loading, setLoading] = useState(true);
    const [pokemon, setPokemon] = useState([])
    const [onepokemon, setOnepokemon] = useState([]);

    useEffect(() => {
        async function getData() {
            try {
                const data1 = await getPokemon(1);
                const data = await getPokemonList();
                setPokemon(data.results)
                setOnepokemon(data1)
            } catch(err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        getData();
    }, [])

    console.log(pokemon);
    console.log(onepokemon)

    return(
        <div>A</div>
    )
}