import { useEffect, useState, type ReactNode } from 'react';
import { ALL_GENS } from './generations';
import { GenerationsContext } from './useGenerations';

const STORAGE_KEY = "selectedGenerations";

function loadSelected(): number[] {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
        if(Array.isArray(saved)) {
            return saved.filter(gen => ALL_GENS.includes(gen));
        }
    } catch {
        // Storage unavailable or corrupt, fall back to the default
    }
    return ALL_GENS;
}

export function GenerationsProvider({ children }: { children: ReactNode }) {
    const [ selected, setSelected ] = useState<number[]>(loadSelected);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
        } catch {
            // Not being able to save the selection isn't worth breaking the page over
        }
    }, [selected]);

    function toggle(gen: number) {
        setSelected(prev => prev.includes(gen)
            ? prev.filter(g => g !== gen)
            : [...prev, gen].sort((a, b) => a - b));
    }

    return (
        <GenerationsContext.Provider value={{ selected, toggle }}>
            {children}
        </GenerationsContext.Provider>
    );
}
