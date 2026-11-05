import type { ReactNode } from 'react';
import type { Direction, GuessProps, TypeRelation } from '../types';
import { spriteUrl } from '../services/pokeApi';
import { ArrowUp, ArrowDown, Check } from './Icons';

// Same column layout as the header row in SearchBar
export const guessGrid = "grid grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] gap-2";

function Tile({ children, tone }: { children: ReactNode, tone: "good" | "warn" | "bad" | "neutral" }) {
    const tones = {
        good: "bg-good/15 border-good/50 text-good",
        warn: "bg-warn/15 border-warn/50 text-warn",
        bad: "bg-bad/15 border-bad/50 text-bad",
        neutral: "bg-surface-2 border-line text-muted",
    };
    return (
        <div className={`h-20 rounded-xl border flex flex-col items-center justify-center text-center text-xs sm:text-sm font-semibold px-1 ${tones[tone]}`}>
            {children}
        </div>
    )
}

// The server compares the guess with the answer; this only draws it
export default function Guesses({ comparison }: GuessProps) {
    const { guess } = comparison;

    function stat(direction: Direction, value: number, unit: string) {
        const label = <span className="text-[11px] text-white/70 mt-0.5">{value / 10} {unit}</span>;
        if(direction === "equal") {
            return <Tile tone="good"><Check />{label}</Tile>;
        }
        return <Tile tone="warn">{direction === "higher" ? <ArrowUp /> : <ArrowDown />}{label}</Tile>;
    }

    function type(relation: TypeRelation) {
        switch(relation) {
            case "same": return <Tile tone="good">Same type</Tile>;
            case "effective": return <Tile tone="warn">Effective against</Tile>;
            case "weak": return <Tile tone="bad">Weak against</Tile>;
            default: return <Tile tone="neutral">Neutral</Tile>;
        }
    }

    return(
        <div className={`${guessGrid} animate-pop`}>
            <div className={`h-20 rounded-xl border flex items-center gap-1 pr-2 ${comparison.correct ? "bg-good/15 border-good/50" : "bg-surface-2 border-line"}`}>
                <img src={spriteUrl(guess.id)} alt="" className="w-16 h-16 shrink-0 pixelated" />
                <p className="capitalize font-semibold text-sm truncate">{guess.name}</p>
            </div>
            {stat(comparison.height, guess.height, "m")}
            {stat(comparison.weight, guess.weight, "kg")}
            {type(comparison.type)}
        </div>
    )
}
