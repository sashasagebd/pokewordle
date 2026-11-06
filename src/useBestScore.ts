import type { Mode } from './types';
import { apiGens } from './services/pokeApi';
import { sameGens } from './generations';
import { useGenerations } from './useGenerations';
import { usePlayer } from './usePlayer';

// The player's best for a mode and the selected generations, as the server
// keeps it (0 if there's none yet). recordScore updates it at once after a
// move the server counted; the server records it itself.
export function useBestScore(mode: Mode) {
    const { me, recordScore } = usePlayer();
    const { selected } = useGenerations();
    const gens = apiGens(selected);
    const best = me?.best.find(b => b.mode === mode && sameGens(b.gens, gens))?.best ?? 0;

    return { best, recordScore: (score: number) => recordScore(mode, gens, score) };
}
