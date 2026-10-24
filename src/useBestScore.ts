import { useEffect, useState } from 'react';

function loadBest(key: string) {
    try {
        const saved = Number(localStorage.getItem(key));
        return Number.isInteger(saved) && saved > 0 ? saved : 0;
    } catch {
        // Storage unavailable, start from zero
        return 0;
    }
}

// Best streak for a game mode, remembered in this browser between visits
export function useBestScore(mode: string) {
    const key = `bestScore:${mode}`;
    const [ best, setBest ] = useState<number>(() => loadBest(key));

    useEffect(() => {
        try {
            localStorage.setItem(key, String(best));
        } catch {
            // Not being able to save the score isn't worth breaking the game over
        }
    }, [key, best]);

    function recordStreak(streak: number) {
        setBest(b => Math.max(b, streak));
    }

    return { best, recordStreak };
}
