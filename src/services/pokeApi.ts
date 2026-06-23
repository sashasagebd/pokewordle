import type { Pokemon } from '../types'

export async function getPokemonList(limit = 200) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);
    if(!res.ok) {
        throw new Error("Error fetching pokemon");
    }
    return res.json();
}

export async function getPokemon(name: string) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    if(!res.ok) {
        throw new Error("Error fetching specific pokemon");
    }
    return res.json();
}

export async function getPokemonPic(num: number) {
    const res = await fetch (`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${num}.png`)
    if(!res.ok) {
        throw new Error("Error fetching pokemon png")
    }
    return res;
}

export async function getRandomPokemon(): Promise<Pokemon> {
    const randomNum = Math.ceil(Math.random() * 200);
    return getPokemon(String(randomNum));
}