import { useEffect, useState } from 'react';
import type { Game, Mode } from './types';
import { apiGens, getGame, startGame } from './services/pokeApi';
import { useGenerations } from './useGenerations';

const storageKey = (mode: Mode) => `game:${mode}`;

function savedGameId(mode: Mode) {
    try {
        return localStorage.getItem(storageKey(mode));
    } catch {
        return null;
    }
}

function saveGameId(mode: Mode, id: string) {
    try {
        localStorage.setItem(storageKey(mode), id);
    } catch {
        // Then a reload starts a new game; nothing worse
    }
}

const sameGens = (a: number[], b: number[]) => a.length === b.length && a.every((g, i) => g === b[i]);

// Opening a game is shared while in flight, so mounting twice (React's
// StrictMode does) doesn't start two games, the second abandoning the first.
const opening = new Map<Mode, Promise<Game>>();

async function openGame(mode: Mode, selected: number[]): Promise<Game> {
    const id = savedGameId(mode);
    if(id) {
        try {
            const game = await getGame(id);
            if(game.status === "active" && sameGens(game.gens, apiGens(selected))) {
                return game;
            }
        } catch {
            // Gone or not ours any more: start afresh
        }
    }
    const game = await startGame(mode, selected);
    saveGameId(mode, game.id);
    return game;
}

// The player's game of a mode: the one in progress (after a reload, say) if
// it's for the selected generations, otherwise a new one.
export function useGame(mode: Mode) {
    const { selected } = useGenerations();
    const [ game, setGame ] = useState<Game | null>(null);
    const [ loadError, setLoadError ] = useState<string>('');

    useEffect(() => {
        let cancelled = false;
        let p = opening.get(mode);
        if(!p) {
            p = openGame(mode, selected).finally(() => opening.delete(mode));
            opening.set(mode, p);
        }
        p.then(g => { if(!cancelled) setGame(g); })
         .catch(err => { if(!cancelled) setLoadError(`Couldn't reach the game server: ${err.message}`); });
        return () => { cancelled = true; };
    // Generations only change on the home page, so this runs once per visit
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode]);

    // Starts a new game (it replaces the current one on the server) without
    // showing it yet, so the caller decides when.
    async function newGame(): Promise<Game> {
        const g = await startGame(mode, selected);
        saveGameId(mode, g.id);
        return g;
    }

    return { game, setGame, newGame, loadError };
}
