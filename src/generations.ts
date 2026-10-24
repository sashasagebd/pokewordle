export const GENERATIONS = [
    { label: "Gen 1", start: 1, end: 151 },
    { label: "Gen 2", start: 152, end: 251 },
    { label: "Gen 3", start: 252, end: 386 },
    { label: "Gen 4", start: 387, end: 493 },
    { label: "Gen 5", start: 494, end: 649 },
    { label: "Gen 6", start: 650, end: 721 },
    { label: "Gen 7", start: 722, end: 809 },
    { label: "Gen 8", start: 810, end: 905 },
    { label: "Gen 9", start: 906, end: 1025 },
];

export const ALL_GENS = GENERATIONS.map((_, index) => index);

// Nothing selected means every generation is in play
function activeGens(gens: number[]) {
    return (gens.length ? gens : ALL_GENS).map(index => GENERATIONS[index]);
}

// Weighted by generation size so every Pokemon in the selection is equally likely
export function randomIdFromGens(gens: number[]) {
    const ranges = activeGens(gens);
    const total = ranges.reduce((sum, g) => sum + g.end - g.start + 1, 0);
    let n = Math.floor(Math.random() * total);
    for(const g of ranges) {
        const size = g.end - g.start + 1;
        if(n < size) return g.start + n;
        n -= size;
    }
    return ranges[ranges.length - 1].end;
}

export function isInGens(id: number, gens: number[]) {
    return activeGens(gens).some(g => id >= g.start && id <= g.end);
}
