import { useState, useEffect } from 'react';
import { getPokemonList, getPokemon } from "../services/pokeApi";
import SearchBar from './SearchBar';

export default function PokemonContainer() {
    const [loadingList, setLoadingList] = useState(true);
    const [loadingOne, setLoadingOne] = useState(true);
    const [pokemon, setPokemon] = useState([])
    const [onepokemon, setOnePokemon] = useState(null);

    useEffect(() => {
        async function getData() {
            try {
                const pokeData = await getPokemonList();
                setPokemon(pokeData.results)
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingList(false);
            }
        }
        getData();
        
        async function getOnePokemon() {
            const randomNum = (Math.ceil(Math.random() * 20));
            try {
                const onePokeData = await getPokemon(randomNum);
                setOnePokemon(onePokeData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingOne(false);
            }
        }
        getOnePokemon();
    }, []);




    console.log(pokemon);
    console.log(onepokemon)

    return (
        <div>< SearchBar targetPokemon={onepokemon}/></div>
    )
}