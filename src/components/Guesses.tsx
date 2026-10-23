import type { ReactNode } from 'react';
import type { GuessProps } from '../types';
import { ArrowUp, ArrowDown, Check } from './Icons';

const typeMatchups: Record<string, { effective: string[], notEffective: string[] }> = {
    normal: {
        effective: [],
        notEffective: ["rock", "ghost", "steel"]
    },
    fire: {
        effective: ["grass", "ice", "bug", "steel"],
        notEffective: ["water", "rock", "dragon"]
    },
    water: {
        effective: ["fire", "ground", "rock"],
        notEffective: ["grass", "dragon"]
    },
    grass: {
        effective: ["water", "ground", "rock"],
        notEffective: ["fire", "poison", "flying", "bug", "dragon", "steel"]
    },
    electric: {
        effective: ["water", "flying"],
        notEffective: ["grass", "ground", "dragon"]
    },
    ice: {
        effective: ["grass", "ground", "flying", "dragon"],
        notEffective: ["fire", "water", "steel"]
    },
    fighting: {
        effective: ["normal", "ice", "rock", "dark", "steel"],
        notEffective: ["poison", "flying", "psychic", "bug", "ghost", "fairy"]
    },
    poison: {
        effective: ["grass", "fairy"],
        notEffective: ["ground", "rock", "ghost"]
    },
    ground: {
        effective: ["poison", "rock", "steel", "fire", "electric"],
        notEffective: ["bug", "grass", "flying"]
    },
    flying: {
        effective: ["fighting", "bug", "grass"],
        notEffective: ["rock", "steel", "electric"]
    },
    psychic: {
        effective: ["fighting", "poison"],
        notEffective: ["steel", "dark"]
    },
    bug: {
        effective: ["grass", "psychic", "dark"],
        notEffective: ["fighting", "flying", "poison", "ghost", "steel", "fire", "fairy"]
    },
    rock: {
        effective: ["flying", "bug", "fire", "ice"],
        notEffective: ["fighting", "ground", "steel"]
    },
    ghost: {
        effective: ["psychic"],
        notEffective: ["dark", "normal"]
    },
    dragon: {
        effective: [],
        notEffective: ["steel", "fairy"]
    },
    dark: {
        effective: ["ghost", "psychic"],
        notEffective: ["fighting", "fairy"]
    },
    steel: {
        effective: ["rock", "ice", "fairy"],
        notEffective: ["fire", "water", "electric"]
    },
    fairy: {
        effective: ["fighting", "dragon", "dark"],
        notEffective: ["poison", "steel", "fire"]
    }
}

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

export default function Guesses( {guessPokemon, targetPokemon}: GuessProps ) {

    function compareTwo(guess: number, target: number, unit: string) {
        const label = <span className="text-[11px] text-white/70 mt-0.5">{guess / 10} {unit}</span>;
        if(guess === target) {
            return <Tile tone="good"><Check />{label}</Tile>;
        }
        else if(guess > target) {
            return <Tile tone="warn"><ArrowDown />{label}</Tile>;
        }
        else {
            return <Tile tone="warn"><ArrowUp />{label}</Tile>;
        }
    }

    function typeMatchup(guess: string, target: string) {
        if(guess === target) {
           return <Tile tone="good">Same type</Tile>;
        }
        else if(typeMatchups[guess].effective.includes(target)) {
           return <Tile tone="warn">Effective against</Tile>;
        }
        else if(typeMatchups[target].effective.includes(guess)) {
            return <Tile tone="bad">Weak against</Tile>;
        }
        else {
            return <Tile tone="neutral">Neutral</Tile>;
        }
    }

    const correct = guessPokemon.id === targetPokemon.id;

    return(
        <div className={`${guessGrid} animate-pop`}>
            <div className={`h-20 rounded-xl border flex items-center gap-1 pr-2 ${correct ? "bg-good/15 border-good/50" : "bg-surface-2 border-line"}`}>
                <img src={guessPokemon.sprites.front_default} alt="" className="w-16 h-16 shrink-0 pixelated" />
                <p className="capitalize font-semibold text-sm truncate">{guessPokemon.name}</p>
            </div>
            {compareTwo(guessPokemon.height, targetPokemon.height, "m")}
            {compareTwo(guessPokemon.weight, targetPokemon.weight, "kg")}
            {typeMatchup(guessPokemon.types[0].type.name, targetPokemon.types[0].type.name)}
        </div>
    )
}
