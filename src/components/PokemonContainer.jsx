import { useState, useEffect } from 'react';
import { getPokemonList, getPokemon } from "../services/pokeApi";
import SearchBar from './SearchBar';

export default function PokemonContainer() {
    const [loadingList, setLoadingList] = useState(true);
    const [loadingOne, setLoadingOne] = useState(true);
    const [pokemon, setPokemon] = useState([])
    const [onepokemon, setOnePokemon] = useState(null);
    const  pokemonInfo = [];

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
            const randomNum = (Math.ceil(Math.random() * 200));
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

    function getPokemonInfo(pokemon) {
        pokemon.forEach((pokemon, index) => {
            pokemonInfo[index] = {
                name: pokemon.name, 
                sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index + 1}.png`
            };
        });
    }
    getPokemonInfo(pokemon);
    console.log(pokemonInfo);


    console.log(pokemon);
    console.log(onepokemon)

    return (
        <div>< SearchBar targetPokemon={onepokemon} pokemonInfo={pokemonInfo}/></div>
    )
}