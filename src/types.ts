import type { ReactNode } from "react";

export interface Pokemon {
    id: number;
    name: string;
    sprites: { front_default: string };
    height: string;
    weight: string;
    types: { type: { name: string } }[];
}

export interface PokemonInfo {
    name: string;
    sprite: string;
}

export type GuessProps = {
    guessPokemon: Pokemon;
    targetPokemon: Pokemon;
    guessPokemonPic: string;
};

export type SearchProps = {
    targetPokemon: Pokemon | null;
    pokemonInfo: PokemonInfo[];
}

export type HLProps = {
    starterPokemon: Pokemon | null;
}

export interface ButtonProps {
    children: ReactNode;
    onClick?: () => void;
    variant?: ButtonVariant;
}

export interface CardProps {
    children: ReactNode;
    onClick?: () => void;
    sprite?: string;
}

export type ButtonVariant = "red" | "white";