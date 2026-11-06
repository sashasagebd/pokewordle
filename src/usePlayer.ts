import { createContext, useContext } from 'react';
import type { Me, Mode } from './types';

type PlayerValue = {
    // The player's name and best scores; null until loaded (or if the server
    // can't be reached)
    me: Me | null;
    refresh: () => Promise<void>;
    // Records a score the server has just counted, so bests update at once
    // without asking it again. gens are the API's (1 to 9).
    recordScore: (mode: Mode, gens: number[], score: number) => void;
};

export const PlayerContext = createContext<PlayerValue | null>(null);

export function usePlayer() {
    const value = useContext(PlayerContext);
    if(!value) {
        throw new Error("usePlayer must be used inside PlayerProvider");
    }
    return value;
}
