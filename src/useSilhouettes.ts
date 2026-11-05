import { useEffect, useRef } from 'react';
import { silhouetteUrl } from './services/pokeApi';

// Who's That silhouettes, fetched once each from the API (which never says
// who's in them). Fetching the next round's while this one is played makes
// "Next Pokémon" instant.
export function useSilhouettes() {
    const requests = useRef(new Map<string, Promise<string>>());
    const ready = useRef(new Map<string, string>());

    useEffect(() => {
        const r = requests.current, done = ready.current;
        return () => {
            for(const url of done.values()) URL.revokeObjectURL(url);
            r.clear();
            done.clear();
        };
    }, []);

    function get(gameId: string, n: number): Promise<string> {
        const key = `${gameId}/${n}`;
        let p = requests.current.get(key);
        if(!p) {
            p = silhouetteUrl(gameId, n);
            requests.current.set(key, p);
            p.then(url => ready.current.set(key, url), () => requests.current.delete(key));
        }
        return p;
    }

    // The silhouette if it's already downloaded, to show without a spinner
    function peek(gameId: string, n: number): string | undefined {
        return ready.current.get(`${gameId}/${n}`);
    }

    return { get, peek };
}
