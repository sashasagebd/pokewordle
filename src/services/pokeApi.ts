import type { Pokemon } from '../types'
import { randomIdFromGens } from '../generations'

// pokewordle-api on the home server. Set VITE_API_URL to use another one,
// e.g. a local copy at http://localhost:8080.
const API_URL = (import.meta.env.VITE_API_URL ?? 'https://pokewordle-api.sashasagebd.com').replace(/\/+$/, '');

export const spriteUrl = (id: number) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

async function get<T>(path: string): Promise<T> {
    const res = await fetch(`${API_URL}${path}`);
    if(!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `${res.status} ${res.statusText}`);
    }
    return res.json();
}

// Every Pokémon in dex order (about 100 KB, cached by the browser for an hour)
export function getPokemonList(): Promise<Pokemon[]> {
    return get('/pokemon');
}

// One Pokémon by dex number or name
export function getPokemon(nameOrId: string | number): Promise<Pokemon> {
    return get(`/pokemon/${encodeURIComponent(String(nameOrId).trim().toLowerCase())}`);
}

export function getRandomPokemon(gens: number[]): Promise<Pokemon> {
    return getPokemon(randomIdFromGens(gens));
}
