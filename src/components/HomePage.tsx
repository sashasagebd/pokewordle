import { Link } from 'react-router-dom';
import Card from './Card'
import pokeBall from '../assets/pokeball.svg'
import { GENERATIONS } from '../generations'
import { useGenerations } from '../useGenerations'
import { spriteUrl } from '../services/pokeApi'
import AccountCard from './AccountCard'


const modes = [
    { to: "pokewordle", title: "PokéWordle", blurb: "Guess the mystery Pokémon from height, weight and type clues.", sprite: 25, silhouette: false },
    { to: "higherlower", title: "Higher or Lower", blurb: "Is the next Pokémon taller or heavier? Build a streak.", sprite: 143, silhouette: false },
    { to: "guesspokemon", title: "Who's That Pokémon?", blurb: "Name the Pokémon from its silhouette alone.", sprite: 94, silhouette: true },
];

export default function HomePage() {
    const { selected, toggle } = useGenerations();

    return(
        <div className="min-h-screen flex flex-col items-center px-4 py-12 sm:py-16">
            <header className="flex flex-col items-center text-center gap-3 mb-10">
                <img src={pokeBall} alt="" className="w-14 h-14 drop-shadow-lg" />
                <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
                    Poké<span className="text-poke">Wordle</span>
                </h1>
                <p className="text-muted max-w-md">Three ways to test how well you really know your Pokémon.</p>
                <Link to="/leaderboard" className="text-sm font-semibold text-gold hover:underline">🏆 Leaderboards</Link>
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

            <Link to="/versus" className="group mt-4 w-full max-w-4xl">
                <Card className="p-5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left transition group-hover:-translate-y-1 group-hover:border-poke/60">
                    <div className="flex -space-x-4 shrink-0">
                        <img src={spriteUrl(6)} alt="" className="w-20 h-20 pixelated transition group-hover:scale-110" />
                        <img src={spriteUrl(9)} alt="" className="w-20 h-20 pixelated -scale-x-100 transition group-hover:scale-110 group-hover:-scale-x-110" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold">Versus <span className="ml-1 align-middle rounded-full bg-gold/15 text-gold text-xs font-semibold px-2 py-0.5">New</span></h2>
                        <p className="text-sm text-muted mt-1">Race up to 3 friends, live, in any of the three modes. Make a room and send them the code.</p>
                    </div>
                    <span className="rounded-xl bg-poke group-hover:bg-poke-dark px-5 py-2 font-display font-semibold transition">Play</span>
                </Card>
            </Link>

            <Card className="mt-8 w-full max-w-4xl p-5">
                <h2 className="font-semibold text-lg">Generations</h2>
                <p className="text-sm text-muted mb-3">Pick which generations to include.</p>
                <div className="flex flex-wrap gap-2">
                    {GENERATIONS.map((generation, index) => (
                        <button
                            key={generation.label}
                            onClick={() => toggle(index)}
                            className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold border transition ${selected.includes(index) ? "bg-poke border-poke text-white" : "bg-surface-2 border-line text-muted hover:text-white hover:border-muted"}`}
                        >
                            {generation.label}
                        </button>
                    ))}
                </div>
                {selected.length === 0 && (
                    <p className="text-sm text-muted mt-3">None selected, so all generations will be used.</p>
                )}
            </Card>

            <AccountCard />
        </div>
    )
}
