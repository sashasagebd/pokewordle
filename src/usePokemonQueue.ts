import { useRef } from 'react';
import type { Pokemon } from './types';
import { getRandomPokemon } from './services/pokeApi';

const QUEUE_SIZE = 3;

// Resolves once the sprite is downloaded and decoded, so swapping it in is instant
function preloadImage(src: string) {
    return new Promise<void>(resolve => {
        const img = new Image();
        img.onload = img.onerror = () => resolve();
        img.src = src;
    });
}

async function fetchReadyPokemon(gens: number[]) {
    const pokemon = await getRandomPokemon(gens);
    await preloadImage(pokemon.sprites.front_default);
    return pokemon;
}

// Keeps a few Pokemon fetched ahead of time with their images already loaded
export function usePokemonQueue(gens: number[]) {
    const queue = useRef<Pokemon[]>([]);
    const filling = useRef<boolean>(false);

    async function fillQueue() {
        if(filling.current) return;
        filling.current = true;
        try {
            while(queue.current.length < QUEUE_SIZE) {
                queue.current.push(await fetchReadyPokemon(gens));
            }
        } catch (err) {
            console.error(err);
        } finally {
            filling.current = false;
        }
    }

    // A preloaded Pokemon if one is ready right now, so callers can swap without a loading state
    function takeReady(excludeId?: number): Pokemon | undefined {
        const index = queue.current.findIndex(p => p.id !== excludeId);
        const ready = index >= 0 ? queue.current.splice(index, 1)[0] : undefined;
        fillQueue();
        return ready;
    }

    async function takeNext(excludeId?: number): Promise<Pokemon> {
        return takeReady(excludeId) ?? await fetchReadyPokemon(gens);
    }

    return { fillQueue, takeReady, takeNext };
}
