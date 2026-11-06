import type { ReactNode } from "react";

// As pokewordle-api serves it. Height is in decimetres and weight in hectograms.
export interface Pokemon {
    id: number;
    name: string;
    generation: number;
    height: number;
    weight: number;
    types: string[];
}

export interface PokemonInfo {
    name: string;
    sprite: string;
}

// --- Games, as pokewordle-api runs them. The server holds the answers. ---

export type Mode = "wordle" | "higher_lower" | "whos_that";

export type GameStatus = "active" | "won" | "lost" | "abandoned";

// A Pokémon without its values
export interface Named {
    id: number;
    name: string;
}

// Where the answer is relative to the guess
export type Direction = "higher" | "lower" | "equal";

// The guess's first type against the answer's
export type TypeRelation = "same" | "effective" | "weak" | "neutral";

// One Wordle guess against the answer
export interface Comparison {
    guess: Pokemon;
    height: Direction;
    weight: Direction;
    type: TypeRelation;
    correct: boolean;
}

// The visible part of a streak round. Who's That has only n: its silhouette
// comes from the API.
export interface Round {
    n: number;
    current?: Pokemon;  // Higher or Lower: shown with its values
    next?: Named;       // Higher or Lower: its value is the question
    upcoming?: Named;   // Higher or Lower: the one after next, to preload
}

export interface Game {
    id: string;
    mode: Mode;
    gens: number[];     // 1 to 9
    status: GameStatus;
    score: number;      // Wordle: guesses; the others: the streak
    round?: Round;      // streak modes, while active
    guesses?: Comparison[]; // Wordle, oldest first
    answer?: Pokemon;   // once the game is over
}

// A best score for a mode and exact set of generations (1 to 9)
export interface Best {
    mode: Mode;
    gens: number[];
    best: number;       // Wordle: fewest guesses; the others: longest streak
    gameId: string;
    achievedAt: string;
}

export interface Me {
    username: string | null; // null for a guest
    best: Best[];
}

export interface LeaderboardEntry {
    rank: number;
    username: string;
    best: number;
    achievedAt: string;
}

export interface Leaderboard {
    entries: LeaderboardEntry[];
    // With a token, if the player has a best here. rank is null for a guest,
    // who isn't on the board until they claim a name.
    me?: { rank: number | null, best: number };
}

export type Answer =
    | { n: number, dir: "higher" | "lower", stat: "height" | "weight" }
    | { n: number, name: string };

export type GuessProps = {
    comparison: Comparison;
};

export type SearchProps = {
    pokemonInfo: PokemonInfo[];
}

export type GuessPokemonProps = {
    pokemonInfo: PokemonInfo[];
}

export type PokemonSearchProps = {
    pokemonInfo: PokemonInfo[];
    onSubmit: (name: string) => void;
    onType?: () => void;
    placeholder?: string;
    disabled?: boolean;
    showSprites?: boolean;
}

export interface ButtonProps {
    children: ReactNode;
    onClick?: () => void;
    variant?: ButtonVariant;
    className?: string;
    disabled?: boolean;
    autoFocus?: boolean;
    type?: "button" | "submit";
}

export interface CardProps {
    children?: ReactNode;
    className?: string;
}

export type ButtonVariant = "primary" | "secondary";
