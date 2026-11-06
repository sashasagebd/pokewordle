import { useEffect, useState, type ReactNode } from 'react';
import type { Me, Mode } from './types';
import { getMe } from './services/pokeApi';
import { sameGens } from './generations';
import { PlayerContext } from './usePlayer';

// Fewer guesses is better in Wordle; a longer streak in the others
const isBetter = (mode: Mode, score: number, than: number) => mode === "wordle" ? score < than : score > than;

export function PlayerProvider({ children }: { children: ReactNode }) {
    const [ me, setMe ] = useState<Me | null>(null);

    async function refresh() {
        try {
            setMe(await getMe());
        } catch(err) {
            console.error(err);
        }
    }

    useEffect(() => {
        refresh();
        // Bests used to live in the browser, where they could be anything;
        // the server's are the real ones now
        try {
            localStorage.removeItem("bestScore:higherlower");
            localStorage.removeItem("bestScore:guesspokemon");
        } catch {
            // Nothing to clean up then
        }
    }, []);

    function recordScore(mode: Mode, gens: number[], score: number) {
        setMe(prev => {
            if(!prev || score < 1) return prev;
            const i = prev.best.findIndex(b => b.mode === mode && sameGens(b.gens, gens));
            if(i >= 0 && !isBetter(mode, score, prev.best[i].best)) return prev;
            const entry = { mode, gens, best: score, gameId: i >= 0 ? prev.best[i].gameId : "", achievedAt: new Date().toISOString() };
            const best = i >= 0 ? prev.best.map((b, j) => j === i ? entry : b) : [...prev.best, entry];
            return { ...prev, best };
        });
    }

    return (
        <PlayerContext.Provider value={{ me, refresh, recordScore }}>
            {children}
        </PlayerContext.Provider>
    );
}
