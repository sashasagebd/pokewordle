import { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from './Card'
import pokeBall from '../assets/pokeball.svg'

const spriteUrl = (id: number) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

const modes = [
    { to: "pokewordle", title: "PokéWordle", blurb: "Guess the mystery Pokémon from height, weight and type clues.", sprite: 25, silhouette: false },
    { to: "higherlower", title: "Higher or Lower", blurb: "Is the next Pokémon taller or heavier? Build a streak.", sprite: 143, silhouette: false },
    { to: "guesspokemon", title: "Who's That Pokémon?", blurb: "Name the Pokémon from its silhouette alone.", sprite: 94, silhouette: true },
];

export default function HomePage() {
    const [ selected, setSelected ] = useState<string[]>([])

    const generationNums = [[0, 151], [151, 251], [251, 386], [386, 493], [493, 649], [649, 721], [721, 809], [809, 905], [905, 1025]];
    const generations = ["Gen 1", "Gen 2", "Gen 3", "Gen 4", "Gen 5", "Gen 6", "Gen 7", "Gen 8", "Gen 9"];

    function handleGeneration(generation: string) {
        setSelected(prev => {
            if (prev.includes(generation)) {
            return prev.filter(g => g !== generation); // toggle off
            } else {
            return [...prev, generation]; // add
            }
        });
    }

    return(
        <div className="min-h-screen flex flex-col items-center px-4 py-12 sm:py-16">
            <header className="flex flex-col items-center text-center gap-3 mb-10">
                <img src={pokeBall} alt="" className="w-14 h-14 drop-shadow-lg" />
                <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
                    Poké<span className="text-poke">Wordle</span>
                </h1>
                <p className="text-muted max-w-md">Three ways to test how well you really know your Pokémon.</p>
            </header>

            <div className="grid gap-4 w-full max-w-4xl sm:grid-cols-3">
                {modes.map(mode => (
                    <Link key={mode.to} to={mode.to} className="group">
                        <Card className="h-full p-5 flex flex-col items-center text-center transition group-hover:-translate-y-1 group-hover:border-poke/60">
                            <div className="w-28 h-28 mb-3 rounded-full bg-surface-2 flex items-center justify-center">
                                <img
                                    src={spriteUrl(mode.sprite)}
                                    alt=""
                                    className={`w-24 h-24 pixelated transition group-hover:scale-110 ${mode.silhouette ? "brightness-0" : ""}`}
                                />
                            </div>
                            <h2 className="text-xl font-semibold">{mode.title}</h2>
                            <p className="text-sm text-muted mt-1 flex-1">{mode.blurb}</p>
                            <span className="mt-4 rounded-xl bg-poke group-hover:bg-poke-dark px-5 py-2 font-display font-semibold transition">Play</span>
                        </Card>
                    </Link>
                ))}
            </div>

            <Card className="mt-8 w-full max-w-4xl p-5">
                <h2 className="font-semibold text-lg">Generations</h2>
                <p className="text-sm text-muted mb-3">Pick which generations to include.</p>
                <div className="flex flex-wrap gap-2">
                    {generations.map((generation, index) => (
                        <button
                            key={index}
                            onClick={() => handleGeneration(generation)}
                            className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold border transition ${selected.includes(generation) ? "bg-poke border-poke text-white" : "bg-surface-2 border-line text-muted hover:text-white hover:border-muted"}`}
                        >
                            {generation}
                        </button>
                    ))}
                </div>
            </Card>
        </div>
    )
}
