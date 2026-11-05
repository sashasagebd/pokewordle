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

export type GuessProps = {
    guessPokemon: Pokemon;
    targetPokemon: Pokemon;
};

export type SearchProps = {
    targetPokemon: Pokemon | null;
    pokemonInfo: PokemonInfo[];
    onNewGame: () => void;
}

export type HLProps = {
    starterPokemon: Pokemon | null;
}

export type GuessPokemonProps = {
    starterPokemon: Pokemon | null;
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
}

export interface CardProps {
    children?: ReactNode;
    className?: string;
}

export type ButtonVariant = "primary" | "secondary";
