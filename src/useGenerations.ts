import { createContext, useContext } from 'react';

type GenerationsValue = {
    selected: number[];
    toggle: (gen: number) => void;
};

export const GenerationsContext = createContext<GenerationsValue | null>(null);

export function useGenerations() {
    const value = useContext(GenerationsContext);
    if(!value) {
        throw new Error("useGenerations must be used inside GenerationsProvider");
    }
    return value;
}
