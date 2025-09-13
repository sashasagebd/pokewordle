export async function getPokemonList(limit = 20) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);
    if(!res.ok) {
        throw new Error("Error fetching pokemon");
    }
    return res.json();
}

export async function getPokemon(name) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    if(!res.ok) {
        throw new Error("Error fetching specific pokemon");
    }
    return res.json();
}